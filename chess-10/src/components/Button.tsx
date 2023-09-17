interface ButtonProps {
    onClick?: () => void;  // Define an optional onClick handler prop
    children?: React.ReactNode;  // Define an optional children prop to allow text or other elements to be passed in
}

function Button({ onClick, children }: ButtonProps) {
    return (
        <>
            <button
                type="button"
                className="coolBeans back"
                onClick={onClick}  // Pass the onClick handler to the button element
            >
                {children}
            </button>
        </>
    );
}

export default Button;