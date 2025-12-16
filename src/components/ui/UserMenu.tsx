import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export function UserMenu() {
  const { currentUser, logout } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu((prev) => !prev)}
        ref={buttonRef}
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
      >
        {initials}
      </button>
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-9 z-20 w-56 rounded-lg border bg-card/95 p-3 text-xs shadow-xl"
        >
          <div className="mb-2 text-[11px] text-muted-foreground">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em]">
              Signed in as
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {currentUser.name}
            </p>
            <p className="truncate">{currentUser.email}</p>
            <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]">
              {currentUser.role === "admin" ? "Admin" : "User"}
            </p>
          </div>
          <div className="mt-2 border-t pt-2">
            <button
              type="button"
              onClick={logout}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
