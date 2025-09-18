import React, { useRef } from 'react';

type IconProps = {
  onSelect: (url: string, file: File) => void;
  accept?: string;
  buttonLabel?: string;
  className?: string;
};

function Icon({ onSelect, accept = 'image/*', buttonLabel = '画像を選択', className }: IconProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    onSelect(objectUrl, file);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <button type="button" onClick={handleClick} className="select-image-button">
        {buttonLabel}
      </button>
    </div>
  );
}

export default Icon;


