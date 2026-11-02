import { Outlet } from 'react-router'
import { SideMenu } from '../organisms/SideMenu.tsx'

/** Layout comum às páginas com menu: feed, detalhes do post e publicar. */
export function MainTemplate() {
  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-6 px-4 pt-14 pb-36 md:gap-14 md:px-15 md:pb-48 xl:flex-row xl:gap-6 xl:px-0 xl:pb-14">
      <SideMenu />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
