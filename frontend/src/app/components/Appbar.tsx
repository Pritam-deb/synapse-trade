export const Appbar = () => {
  return (
    <div className="bg-black sticky top-0 w-full">
      <div className="relative flex h-16 w-full items-center justify-between px-6">
        {/* Left Side - Logo and Menu */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="text-white font-semibold flex items-center space-x-2">
            <span className="text-orange-500">💸</span>{" "}
            {/* Replace with actual logo */}
            <span>Synapse</span>
          </div>

          {/* Menu Items */}
          <nav className="hidden md:flex space-x-4 text-gray-400 text-sm">
            <a href="#" className="hover:text-white">
              Spot
            </a>
            <a href="#" className="hover:text-white">
              Futures
            </a>
            <a href="#" className="hover:text-white">
              Lend
            </a>
            <a href="#" className="hover:text-white">
              More ▼
            </a>
          </nav>
        </div>

        {/* Middle - Search Bar */}
        <div className="flex flex-1 justify-center">
          <div className="flex items-center bg-neutral-800 text-gray-400 rounded-lg px-3 py-1.5 w-[260px]">
            {/* Search Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search text-gray-500"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Search markets"
              className="bg-transparent text-white text-sm flex-1 outline-none px-2"
            />

            {/* Slash Key Indicator */}
            <div className="text-gray-500 bg-neutral-700 text-xs px-1.5 py-0.5 rounded-md">
              /
            </div>
          </div>
        </div>

        {/* Right Side - Auth Buttons */}
        <div className="flex items-center space-x-2">
          <a
            href="/signup"
            className="bg-green-900 opacity-90 text-green-300 font-bold px-3 py-1 rounded-lg hover:bg-green-950"
          >
            Sign up
          </a>
          <a
            href="/login"
            className="bg-blue-900 opacity-90 text-blue-300 font-bold px-3 py-1 rounded-lg hover:bg-blue-950"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};
