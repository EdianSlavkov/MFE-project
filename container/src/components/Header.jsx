export default function Header({ user, cartCount, theme, onToggleTheme }) {
  return (
    <header className="shell-header">
      <span className="shell-logo">MFE Shop</span>
      {user && <span>Hi, {user.name}</span>}
      <span className="shell-badge">Cart: {cartCount}</span>
      <button className="shell-button" onClick={onToggleTheme}>
        Theme: {theme}
      </button>
    </header>
  );
}
