// 画像ファイルを更新するためのコンポーネント
import React, { useRef } from 'react';

// ファイルが選択された際に選択した画像のURLとファイルオブジェクトを親コンポーネントに渡す
type IconProps = {
  onSelect: (url: string, file: File) => void;
  // 画像ファイルのみを指定
  accept?: string;
  buttonLabel?: string;
  className?: string;
};

function Icon({ onSelect, accept = 'image/*', buttonLabel = '画像を選択', className }: IconProps) {
  // inputRefはinput type = "file"を参照する。初期は何も参照しないのでnull型を含める。userefでDOMに直接アクセススできるようにしている
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    // クリックされるとファイル選択ダイアログボックスが表示される
    inputRef.current?.click();
  };

  // Reactのinput要素で発火するイベントハンドラー
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // 選択されたファイル：e.target.files?.[0]
    const file = e.target.files?.[0];
    // ファイルが選択されなかったときにイベントの処理終了
    if (!file) return;
    // 選択されたファイルからURLを生成、onselectコールバックを通じて親コンポーネントに渡す
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


