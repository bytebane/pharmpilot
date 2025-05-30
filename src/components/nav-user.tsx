'use client'
import { signOut } from 'next-auth/react' // Import signOut
import Link from 'next/link' // Import Link from next/link

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

export function NavUser({
	user,
}: {
	user: {
		name: string
		email: string
		avatar: string
	}
}) {
	const { isMobile } = useSidebar()

	const firstLetter = user.name.split(' ')[0][0]
	const lastLetter = user.name.split(' ')[1] ? user.name.split(' ')[1][0] : ''
	const initials = `${firstLetter}${lastLetter}`.toUpperCase()

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<Avatar className='h-8 w-8 rounded-lg'>
								<AvatarImage
									src={user.avatar}
									alt={user.name}
								/>
								<AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>{user.name.split(' ')[0]}</span>
								<span className='truncate text-xs'>{user.email}</span>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={4}>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
								<Avatar className='h-8 w-8 rounded-lg'>
									<AvatarImage
										src={user.avatar}
										alt={user.name}
									/>
									<AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>{user.name}</span>
									<span className='truncate text-xs'>{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{/* <DropdownMenuGroup>
							<DropdownMenuItem>
								<Sparkles />
								Upgrade to Pro
							</DropdownMenuItem>
						</DropdownMenuGroup> */}
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							{/* Updated Account DropdownMenuItem to link to /account */}
							<DropdownMenuItem asChild>
								<Link href='/account'>
									<BadgeCheck className='mr-2 h-4 w-4' /> {/* Added margin for spacing */}
									<span>Account</span>
								</Link>
							</DropdownMenuItem>
							{/* <DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem> */}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						{/* Add onClick handler to trigger signOut */}
						<DropdownMenuItem
							onClick={() => signOut({ callbackUrl: '/login' })} // Redirect to login after logout
						>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
