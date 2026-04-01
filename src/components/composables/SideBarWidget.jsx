import { NavLink } from "react-router-dom";
import { menus } from "../../services/menus";
import Icon from "../_Icon";

export default function Sidebar({ isMinimized }) {
  return (
    <aside className={`bg-white border-r border-slate-100 text-slate-900 py-6 shadow-[2px_0_24px_rgba(0,0,0,0.02)] h-[calc(100vh-64px)] overflow-y-auto flex flex-col z-10 relative transition-all duration-300 ${isMinimized ? 'w-[88px] px-2' : 'w-64 px-4'}`}>
      <div className="flex-1 overflow-y-auto space-y-8 pb-10 scrollbar-hide">
        {menus.map((group, i) => (
          <div key={i} className="px-1">
            {!isMinimized && (
              <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-[0.2em] px-2 flex items-center gap-2 overflow-hidden whitespace-nowrap">
                {group.tag}
                <span className="h-px bg-slate-100 flex-1"></span>
              </p>
            )}
            {isMinimized && i > 0 && (
              <div className="h-px bg-slate-100 mx-2 mb-4 mt-2"></div>
            )}

            <ul className="space-y-1.5">
              {group.items.map((item, index) => {
                return (
                  <li key={index}>
                    <NavLink
                      to={item.path}
                      title={isMinimized ? item.name : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 group relative overflow-hidden
                        ${isMinimized ? 'justify-center px-0' : 'px-3'}
                        ${isActive
                          ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                          )}
                          <div
                            className={`flex items-center justify-center transition-all duration-300 ${isActive ? "scale-110 text-blue-600 ml-0.5" : `group-hover:scale-110 text-slate-400 group-hover:text-slate-600 ${isMinimized ? '' : ''}`}`}
                          >
                            <Icon
                              name={item.icon}
                              size={isMinimized ? 20 : 18}
                              className="flex-shrink-0"
                            />
                          </div>
                          {!isMinimized && (
                            <span className={`${isActive ? "ml-0.5" : ""} whitespace-nowrap`}>
                              {item.name}
                            </span>
                          )}

                          {isActive && (
                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.6)] animate-pulse" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
