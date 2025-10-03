// scripts/create-admin.ts
import { connectToDatabase } from '@/app/lib/mongodb'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    const { db } = await connectToDatabase()
    
    const adminEmail = 'admin@recrutement.com'
    const adminPassword = 'Admin123!' // À changer après la première connexion
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.collection('users').findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('✅ Utilisateur admin existe déjà')
      return
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Créer l'utilisateur admin
    await db.collection('users').insertOne({
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrateur',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    console.log('✅ Utilisateur admin créé avec succès')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Mot de passe: ${adminPassword}`)
    console.log('⚠️  Changez le mot de passe après la première connexion!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  }
}

createAdminUser()