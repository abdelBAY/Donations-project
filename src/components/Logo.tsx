import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z"
          fill="#40CCC0"
          className="dark:fill-blue-600"
        />
        <path
          d="M50 5L88.3 27V73L50 95L11.7 73V27L50 5Z"
          fill="#FAFAFA"
          className="dark:fill-gray-800"
        />
        {/* Top section - Hand with pattern */}
        <path
          d="M50 10L65 18V34L50 42L35 34V18L50 10Z"
          fill="#1E4D5C"
          className="dark:fill-gray-700"
        />
        <path
          d="M50 15C53.866 15 57 18.134 57 22C57 25.866 53.866 29 50 29C46.134 29 43 25.866 43 22C43 18.134 46.134 15 50 15Z"
          fill="#FAFAFA"
          className="dark:fill-gray-200"
        />
        
        {/* Top right section - Bridge */}
        <path
          d="M68 18L83 26V42L68 50V34L68 18Z"
          fill="#F4A261"
          className="dark:fill-orange-500"
        />
        
        {/* Bottom sections - Decorative elements */}
        <path
          d="M32 58L47 66V82L32 90V74L32 58Z"
          fill="#E76F51"
          className="dark:fill-red-500"
        />
        <path
          d="M53 58L68 66V82L53 90V74L53 58Z"
          fill="#2A9D8F"
          className="dark:fill-teal-600"
        />
        
        {/* Stars */}
        <circle cx="25" cy="50" r="2" fill="#FAFAFA" className="dark:fill-gray-200" />
        <circle cx="75" cy="50" r="2" fill="#FAFAFA" className="dark:fill-gray-200" />
        <circle cx="50" cy="75" r="2" fill="#FAFAFA" className="dark:fill-gray-200" />
      </svg>
    </div>
  );
};

export default Logo;