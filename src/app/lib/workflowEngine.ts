// src/app/lib/workflowEngine.ts
import { connectToDatabase } from './mongodb'
import { ObjectId } from 'mongodb'
import {
  Workflow,
  WorkflowExecution,
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowAction,
  WorkflowTriggerCondition
} from '@/app/types/workflows'
import { Candidate, CandidateStatus } from '@/app/types/candidates'

/**
 * Workflow Execution Engine
 * Handles automatic execution of workflows based on triggers
 */
export class WorkflowEngine {
  /**
   * Check if a workflow should execute for a candidate
   */
  static async shouldExecute(
    workflow: Workflow,
    candidate: Candidate,
    triggerContext: {
      type: WorkflowTriggerType
      oldStatus?: CandidateStatus
      newStatus?: CandidateStatus
      addedTag?: string
      removedTag?: string
      daysInStage?: number
      score?: number
    }
  ): Promise<boolean> {
    // Check if workflow is active
    if (!workflow.isActive) {
      return false
    }

    // Check trigger type matches
    if (workflow.trigger.type !== triggerContext.type) {
      return false
    }

    // Check trigger-specific conditions
    switch (triggerContext.type) {
      case WorkflowTriggerType.STATUS_CHANGED:
        return this.checkStatusChangeTrigger(workflow.trigger, triggerContext.oldStatus, triggerContext.newStatus)

      case WorkflowTriggerType.TAG_ADDED:
        return this.checkTagAddedTrigger(workflow.trigger, triggerContext.addedTag)

      case WorkflowTriggerType.TAG_REMOVED:
        return this.checkTagRemovedTrigger(workflow.trigger, triggerContext.removedTag)

      case WorkflowTriggerType.DAYS_IN_STAGE:
        return this.checkDaysInStageTrigger(workflow.trigger, triggerContext.daysInStage)

      case WorkflowTriggerType.SCORE_THRESHOLD:
        return this.checkScoreThresholdTrigger(workflow.trigger, triggerContext.score)

      default:
        return false
    }
  }

  private static checkStatusChangeTrigger(
    trigger: WorkflowTriggerCondition,
    oldStatus?: CandidateStatus,
    newStatus?: CandidateStatus
  ): boolean {
    if (!newStatus) return false

    // Check toStatus condition
    if (trigger.toStatus) {
      if (Array.isArray(trigger.toStatus)) {
        if (!trigger.toStatus.includes(newStatus)) return false
      } else {
        if (trigger.toStatus !== newStatus) return false
      }
    }

    // Check fromStatus condition
    if (trigger.fromStatus && oldStatus) {
      if (Array.isArray(trigger.fromStatus)) {
        if (!trigger.fromStatus.includes(oldStatus)) return false
      } else {
        if (trigger.fromStatus !== oldStatus) return false
      }
    }

    return true
  }

  private static checkTagAddedTrigger(trigger: WorkflowTriggerCondition, addedTag?: string): boolean {
    if (!addedTag) return false

    if (trigger.tag && trigger.tag !== addedTag) return false
    if (trigger.tags && !trigger.tags.includes(addedTag)) return false

    return true
  }

  private static checkTagRemovedTrigger(trigger: WorkflowTriggerCondition, removedTag?: string): boolean {
    if (!removedTag) return false

    if (trigger.tag && trigger.tag !== removedTag) return false
    if (trigger.tags && !trigger.tags.includes(removedTag)) return false

    return true
  }

  private static checkDaysInStageTrigger(trigger: WorkflowTriggerCondition, daysInStage?: number): boolean {
    if (daysInStage === undefined) return false
    if (trigger.daysInStage === undefined) return false

    return daysInStage >= trigger.daysInStage
  }

  private static checkScoreThresholdTrigger(trigger: WorkflowTriggerCondition, score?: number): boolean {
    if (score === undefined) return false

    if (trigger.minScore !== undefined && score < trigger.minScore) return false
    if (trigger.maxScore !== undefined && score > trigger.maxScore) return false

    return true
  }

  /**
   * Execute a workflow for a candidate
   */
  static async executeWorkflow(
    workflowId: string,
    candidateId: string,
    executedBy: string = 'system'
  ): Promise<WorkflowExecution> {
    const { db } = await connectToDatabase()

    // Get workflow
    const workflow = await db.collection('workflows').findOne({ _id: new ObjectId(workflowId) }) as any

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    // Get candidate
    const candidate = await db.collection('candidates').findOne({ _id: new ObjectId(candidateId) }) as any

    if (!candidate) {
      throw new Error('Candidate not found')
    }

    // Create execution record
    const execution: Omit<WorkflowExecution, 'id'> = {
      workflowId: workflow._id.toString(),
      workflowName: workflow.name,
      candidateId: candidate._id.toString(),
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      trigger: workflow.trigger,
      actions: workflow.actions,
      status: 'running',
      startedAt: new Date().toISOString(),
      results: [],
      executedBy
    }

    const executionResult = await db.collection('workflow_executions').insertOne(execution)
    const executionId = executionResult.insertedId.toString()

    console.log(`🚀 Executing workflow: ${workflow.name} for candidate: ${execution.candidateName}`)

    // Execute actions sequentially
    const results = []
    let hasError = false

    for (let i = 0; i < workflow.actions.length; i++) {
      const action = workflow.actions[i]

      try {
        console.log(`  ⚙️ Executing action ${i + 1}/${workflow.actions.length}: ${action.type}`)

        // Check if there's a delay
        if (action.delayMinutes && action.delayMinutes > 0) {
          console.log(`  ⏱️ Delaying action by ${action.delayMinutes} minutes`)
          // In production, you would schedule this action for later
          // For now, we'll skip delayed actions
          results.push({
            actionIndex: i,
            actionType: action.type,
            status: 'skipped' as const,
            message: `Action scheduled for ${action.delayMinutes} minutes later`
          })
          continue
        }

        const result = await this.executeAction(action, candidate, workflow)

        results.push({
          actionIndex: i,
          actionType: action.type,
          status: 'success' as const,
          message: result.message,
          metadata: result.metadata
        })

        console.log(`  ✅ Action completed: ${result.message}`)
      } catch (error: any) {
        console.error(`  ❌ Action failed:`, error.message)

        results.push({
          actionIndex: i,
          actionType: action.type,
          status: 'failed' as const,
          error: error.message
        })

        hasError = true

        // Continue with remaining actions even if one fails
      }
    }

    // Update execution record
    const finalExecution = {
      ...execution,
      id: executionId,
      status: hasError ? ('failed' as const) : ('completed' as const),
      completedAt: new Date().toISOString(),
      results
    }

    await db.collection('workflow_executions').updateOne(
      { _id: new ObjectId(executionId) },
      {
        $set: {
          status: finalExecution.status,
          completedAt: finalExecution.completedAt,
          results: finalExecution.results
        }
      }
    )

    // Update workflow statistics
    await db.collection('workflows').updateOne(
      { _id: new ObjectId(workflowId) },
      {
        $inc: {
          executionCount: 1,
          successCount: hasError ? 0 : 1,
          failureCount: hasError ? 1 : 0
        },
        $set: {
          lastExecutedAt: new Date().toISOString()
        }
      }
    )

    console.log(`✅ Workflow execution completed: ${finalExecution.status}`)

    return finalExecution
  }

  /**
   * Execute a single action
   */
  private static async executeAction(
    action: WorkflowAction,
    candidate: any,
    workflow: any
  ): Promise<{ message: string; metadata?: any }> {
    const { db } = await connectToDatabase()

    switch (action.type) {
      case WorkflowActionType.SEND_EMAIL:
        return await this.executeSendEmailAction(action, candidate)

      case WorkflowActionType.ADD_TAG:
        return await this.executeAddTagAction(action, candidate, db)

      case WorkflowActionType.REMOVE_TAG:
        return await this.executeRemoveTagAction(action, candidate, db)

      case WorkflowActionType.CHANGE_STATUS:
        return await this.executeChangeStatusAction(action, candidate, db)

      case WorkflowActionType.ADD_NOTE:
        return await this.executeAddNoteAction(action, candidate, db)

      case WorkflowActionType.CREATE_TASK:
        return await this.executeCreateTaskAction(action, candidate, db)

      case WorkflowActionType.SEND_NOTIFICATION:
        return await this.executeSendNotificationAction(action, candidate)

      default:
        throw new Error(`Unsupported action type: ${action.type}`)
    }
  }

  private static async executeSendEmailAction(action: WorkflowAction, candidate: any) {
    const { EmailService } = await import('./emailService')

    // Determine recipient
    let to: string
    if (action.emailTo === 'candidate') {
      to = candidate.email
    } else if (action.emailTo === 'assigned_user' && candidate.assignedTo) {
      // In production, fetch user email from database
      to = candidate.assignedTo // Placeholder
    } else if (action.emailCustomRecipient) {
      to = action.emailCustomRecipient
    } else {
      throw new Error('No email recipient specified')
    }

    // Validate email
    if (!EmailService.isValidEmail(to)) {
      throw new Error(`Invalid email address: ${to}`)
    }

    // Prepare variables for template rendering
    const variables = {
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      fullName: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email || '',
      position: candidate.appliedPosition || candidate.currentPosition || '',
      companyName: process.env.COMPANY_NAME || 'Hi-Ring',
      currentDate: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Render subject and body with variables
    const subject = EmailService.renderTemplate(action.emailSubject || 'Notification', variables)
    const body = EmailService.renderTemplate(action.emailBody || '', variables)

    // Send email
    const result = await EmailService.sendEmail({
      to,
      subject,
      text: body,
      html: EmailService['convertToHtml'](body) // Use private method via bracket notation
    })

    if (!result.success) {
      throw new Error(`Failed to send email: ${result.error}`)
    }

    console.log(`✅ Email sent successfully to ${to} (ID: ${result.messageId})`)

    return {
      message: `Email sent to ${to}`,
      metadata: {
        to,
        subject,
        messageId: result.messageId,
        provider: result.provider
      }
    }
  }

  private static async executeAddTagAction(action: WorkflowAction, candidate: any, db: any) {
    const tagName = action.tagName || (action.tagNames && action.tagNames[0])

    if (!tagName) {
      throw new Error('No tag specified')
    }

    // Check if tag already exists
    if (candidate.tags && candidate.tags.includes(tagName)) {
      return { message: `Tag "${tagName}" already exists on candidate` }
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidate._id) },
      { $addToSet: { tags: tagName } }
    )

    return { message: `Tag "${tagName}" added to candidate` }
  }

  private static async executeRemoveTagAction(action: WorkflowAction, candidate: any, db: any) {
    const tagName = action.tagName || (action.tagNames && action.tagNames[0])

    if (!tagName) {
      throw new Error('No tag specified')
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidate._id) },
      { $pull: { tags: tagName } as any }
    )

    return { message: `Tag "${tagName}" removed from candidate` }
  }

  private static async executeChangeStatusAction(action: WorkflowAction, candidate: any, db: any) {
    if (!action.newStatus) {
      throw new Error('No status specified')
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidate._id) },
      {
        $set: { status: action.newStatus, updatedAt: new Date().toISOString() },
        $push: {
          activities: {
            id: new ObjectId().toString(),
            type: 'status_change',
            description: `Status changed to ${action.newStatus} by workflow`,
            userId: 'system',
            userName: 'Workflow Automation',
            timestamp: new Date().toISOString(),
            metadata: { oldStatus: candidate.status, newStatus: action.newStatus }
          }
        } as any
      }
    )

    return { message: `Status changed to ${action.newStatus}` }
  }

  private static async executeAddNoteAction(action: WorkflowAction, candidate: any, db: any) {
    if (!action.noteContent) {
      throw new Error('No note content specified')
    }

    const note = {
      id: new ObjectId().toString(),
      authorId: 'system',
      authorName: 'Workflow Automation',
      content: action.noteContent,
      createdAt: new Date().toISOString(),
      isPrivate: action.noteIsPrivate || false
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidate._id) },
      { $push: { notes: note } as any }
    )

    return { message: 'Note added to candidate' }
  }

  private static async executeCreateTaskAction(action: WorkflowAction, candidate: any, db: any) {
    if (!action.taskTitle) {
      throw new Error('No task title specified')
    }

    const task = {
      candidateId: candidate._id.toString(),
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      title: action.taskTitle,
      description: action.taskDescription || '',
      type: 'custom' as const,
      assignedTo: action.taskAssignTo || candidate.assignedTo || 'unassigned',
      assignedToName: '',
      status: 'pending' as const,
      priority: action.taskPriority || 'medium',
      dueDate: this.calculateDueDate(action.taskDueInDays || 7),
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('tasks').insertOne(task)

    return {
      message: `Task created: ${action.taskTitle}`,
      metadata: { taskId: result.insertedId.toString() }
    }
  }

  private static async executeSendNotificationAction(action: WorkflowAction, candidate: any) {
    // In production, send in-app notification or webhook
    // For now, we'll just log it

    console.log(`🔔 Notification: ${action.notificationMessage}`)

    return {
      message: 'Notification sent',
      metadata: { message: action.notificationMessage }
    }
  }

  private static calculateDueDate(daysFromNow: number): string {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString()
  }

  /**
   * Trigger workflows based on candidate status change
   */
  static async triggerOnStatusChange(
    candidateId: string,
    oldStatus: CandidateStatus,
    newStatus: CandidateStatus
  ): Promise<void> {
    const { db } = await connectToDatabase()

    // Find active workflows with status change trigger
    const workflows = await db
      .collection('workflows')
      .find({
        isActive: true,
        'trigger.type': WorkflowTriggerType.STATUS_CHANGED
      })
      .toArray() as any[]

    const candidate = await db.collection('candidates').findOne({ _id: new ObjectId(candidateId) }) as any

    if (!candidate) {
      console.error('Candidate not found:', candidateId)
      return
    }

    console.log(`🔍 Found ${workflows.length} status change workflows to check`)

    for (const workflow of workflows) {
      const shouldRun = await this.shouldExecute(workflow as Workflow, candidate as Candidate, {
        type: WorkflowTriggerType.STATUS_CHANGED,
        oldStatus,
        newStatus
      })

      if (shouldRun) {
        console.log(`✨ Triggering workflow: ${workflow.name}`)

        // Execute workflow asynchronously (don't wait)
        this.executeWorkflow(workflow._id.toString(), candidateId, 'system').catch(err => {
          console.error(`Error executing workflow ${workflow.name}:`, err)
        })
      }
    }
  }

  /**
   * Trigger workflows based on tag addition
   */
  static async triggerOnTagAdded(candidateId: string, tagName: string): Promise<void> {
    const { db } = await connectToDatabase()

    const workflows = await db
      .collection('workflows')
      .find({
        isActive: true,
        'trigger.type': WorkflowTriggerType.TAG_ADDED
      })
      .toArray() as any[]

    const candidate = await db.collection('candidates').findOne({ _id: new ObjectId(candidateId) }) as any

    if (!candidate) return

    for (const workflow of workflows) {
      const shouldRun = await this.shouldExecute(workflow as Workflow, candidate as Candidate, {
        type: WorkflowTriggerType.TAG_ADDED,
        addedTag: tagName
      })

      if (shouldRun) {
        this.executeWorkflow(workflow._id.toString(), candidateId, 'system').catch(err => {
          console.error(`Error executing workflow ${workflow.name}:`, err)
        })
      }
    }
  }
}
