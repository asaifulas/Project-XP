export default function WindowMenuBar() {
  const menus = ['File', 'Edit', 'View']

  return (
    <div className="xp-menubar">
      {menus.map((menu) => (
        <button
          key={menu}
          type="button"
          className="cursor-default select-none"
        >
          {menu}
        </button>
      ))}
    </div>
  )
}

