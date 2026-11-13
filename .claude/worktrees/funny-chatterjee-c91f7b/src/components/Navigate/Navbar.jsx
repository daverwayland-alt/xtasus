import React from 'react';

const Navbar = () => {
  return (
    <div>
      <div className="navbar bg-base-100 shadow-sm flex justify-between">
        <div className="flex px-4 py-2">
          <a className="btn btn-ghost text-5xl title-main nav">Xtasis</a>
        </div>
        <div className="flex-none px-8 py-2">
          <div className="dropdown dropdown-end"></div>
          <div className="dropdown dropdown-end">
            <div className="avatar avatar-placeholder">
              <div className="bg-neutral text-neutral-content w-12 rounded-full">
                <span className="text-xl">D</span>
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu px-4 py-2 menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
