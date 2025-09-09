import { Link } from "react-router-dom";
import { classNames } from "shared/lib/classNames/classNames";
import cls from "./Navbar.module.scss";
import { AppLink, AppLinkTheme } from "shared/ui/AppLink/AppLink";
import { ThemeSwitcher } from "shared/ui/ThemeSwitcher";
import { useTranslation } from "react-i18next";
import { Button, ThemeButton } from "shared/ui/Button/Button";
import { useCallback, useState } from "react";
import { on } from "events";
import { Modal } from "shared/ui/Modal/Modal";

interface NavbarProps {
  className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
  const { t } = useTranslation();
  const [isAuthModal, setIsAuthModal] = useState(false);
  const onToggleModal = useCallback(() => {
    setIsAuthModal((prev) => !prev);
  }, []);
  return (
    <div className={classNames(cls.navbar, {}, [className])}>
      <Button
        theme={ThemeButton.CLEAR_INVERTED}
        className={cls.links}
        onClick={onToggleModal}
      >
        {t("Войти")}
      </Button>
      <Modal isOpen={isAuthModal} onClose={onToggleModal}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur
        sunt hic est, nesciunt reprehenderit autem provident! Adipisci nulla
        blanditiis sequi molestiae? Sapiente placeat aspernatur laborum harum
        laboriosam perferendis et officia.
      </Modal>
    </div>
  );
};
