import React from 'react';

interface EmptyValuePromptProps {
  label: string;
  className?: string;
  onClick?: () => void;
}

const toPromptLabel = (label: string): string => {
  const trimmedLabel = label.trim().replace(/:$/, '');

  if (!trimmedLabel) {
    return 'thông tin';
  }

  const [firstCharacter, ...restCharacters] = Array.from(trimmedLabel);
  return `${firstCharacter.toLocaleLowerCase('vi-VN')}${restCharacters.join('')}`;
};

const EmptyValuePrompt: React.FC<EmptyValuePromptProps> = ({ label, className = '', onClick }) => {
  const promptLabel = `+ Thêm ${toPromptLabel(label)}`;
  const promptClassName = `inline-flex min-w-0 items-center border-0 bg-transparent p-0 text-left text-sm font-semibold leading-6 text-blue-600 underline decoration-blue-200 underline-offset-4 ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${promptClassName} cursor-pointer`}>
        {promptLabel}
      </button>
    );
  }

  return <span className={promptClassName}>{promptLabel}</span>;
};

export default EmptyValuePrompt;
