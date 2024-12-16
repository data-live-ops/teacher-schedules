import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import '/Users/imamfachrudin/Documents/live ops/class-calendar/src/App.css';

const AdvancedDropdown = ({
    options,
    name,
    value,
    onChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOptionSelect = (selectedOption) => {
        onChange({ target: { name, value: selectedOption } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="relative w-64"
        >
            <div
                onClick={toggleDropdown}
                className="
                    dropdown-selection
                    w-full 
                    p-2 
                    border 
                    rounded-md 
                    cursor-pointer 
                    flex 
                    justify-between 
                    items-center
                "
            >
                <span>
                    {value || placeholder}
                </span>
                <svg
                    className={`
                        w-4 h-4 
                        transition-transform 
                        duration-200 
                        ${isOpen ? 'rotate-180' : ''}
                    `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            {isOpen && (
                <div
                    className="
                        absolute 
                        z-10 
                        w-full 
                        mt-1 
                        bg-white 
                        border 
                        rounded-md 
                        shadow-lg 
                        max-h-60 
                        overflow-y-auto
                    "
                >
                    <div className="p-2 sticky top-0 bg-white z-10 border-b">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: '1em' }}
                                className="
                                    w-full 
                                    p-2 
                                    pl-8 
                                    border 
                                    rounded-md 
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-blue-500
                                "
                            />
                            <Search
                                className="
                                    absolute 
                                    left-2 
                                    top-1/2 
                                    transform 
                                    -translate-y-1/2 
                                    text-gray-400
                                "
                                size={18}
                            />
                        </div>
                    </div>

                    {filteredOptions.length === 0 ? (
                        <div className="p-2 text-center text-gray-500">
                            No options found
                        </div>
                    ) : (
                        <ul>
                            {filteredOptions.map((option) => (
                                <li
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`
                                        p-2 
                                        cursor-pointer 
                                        hover:bg-gray-100 
                                        transition 
                                        duration-200
                                        ${option === value ? 'bg-blue-50' : ''}
                                    `}
                                >
                                    {option === value ? (<div className='mark-selected'>{option}<svg style={{ color: '#1e5af6' }} class="MuiSvgIcon-root _2vH2ncez3o4e-EXS7vaXL7 MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
                                    </svg></div>) : (option)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedDropdown;
