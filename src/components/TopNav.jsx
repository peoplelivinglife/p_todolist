import UserProfile from './UserProfile'

export default function TopNav(){
  return (
    <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div className="container-narrow flex items-center justify-between py-3 sm:py-4">
        <div className="flex items-center gap-2">
          <img 
            src="/mydaylist/pavicon.png" 
            alt="ducklylist logo" 
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
          />
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">ducklylist</h1>
        </div>
        <UserProfile />
      </div>
    </header>
  )
}