const ThinkingDots = ({ text }: { text: string }) => {
  return (
    <div className="thinking">
      <span>{text}</span>
      <span className="dots">
        <i></i>
        <i></i>
        <i></i>
      </span>
    </div>
  );
};

export default ThinkingDots;
