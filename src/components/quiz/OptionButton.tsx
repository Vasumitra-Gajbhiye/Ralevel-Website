import styles from "./quiz.module.css";

export default function OptionButton({
  children,
  state,
  ...props
}: {
  children: React.ReactNode;
  state?: "correct" | "wrong" | "selected";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${styles.optionBtn} ${
        state === "correct"
          ? styles.correct
          : state === "wrong"
          ? styles.wrong
          : state === "selected"
          ? styles.selected
          : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
