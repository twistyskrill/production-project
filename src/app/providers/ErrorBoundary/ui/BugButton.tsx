import { useEffect, useState } from "react";
import { classNames } from "shared/lib/classNames/classNames";
import { Button } from "shared/ui/Button/Button";

interface BugButtonProps {
  className?: string;
}

export const BugButton = ({ className }: BugButtonProps) => {
  const [error, setError] = useState(false);
  const onThrow = () => setError(true);
  useEffect(() => {
    if (error) {
      throw new Error();
    }
  }, [error]);
  return (
    <Button
      onClick={onThrow}
      className={classNames("BugButton", {}, [className])}
    >
      throw error
    </Button>
  );
};
