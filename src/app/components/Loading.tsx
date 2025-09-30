// components/Loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#3b5335ff] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="w-20 h-20 border-4 border-[#ffaf50ff] border-b-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-[#3b5335ff] font-semibold text-lg mt-4">Chargement...</p>
      </div>
    </div>
  )
}