
import { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchProps {
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
  isMobile: boolean;
}

const Search = ({ mobileSearchOpen, setMobileSearchOpen, isMobile }: SearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (mobileSearchOpen && isMobile) {
    return (
      <div className="absolute inset-0 h-full bg-background z-10 px-4 flex items-center">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 pr-10 rounded-full bg-muted border-none focus:outline-none focus:ring-2 focus:ring-accent/50 w-full transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        <Button variant="ghost" size="icon" className="absolute right-4" onClick={() => setMobileSearchOpen(false)}>
          <X size={20} />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative hidden md:block">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 pr-10 rounded-full bg-muted border-none focus:outline-none focus:ring-2 focus:ring-accent/50 w-64 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-3 top-2.5 text-muted-foreground">
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
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
      
      {isMobile && (
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMobileSearchOpen(true)}>
          <SearchIcon size={20} />
        </Button>
      )}
    </>
  );
};

export default Search;
