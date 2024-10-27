import './globals.css'
import { Inter as FontSans } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'

import { cn } from '@/lib/utils'
import Nav from '@/components/Nav'
import { Toaster } from '@/components/ui/sonner'

import Web3ModalProvider from '@/contexts/Web3Modal'

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
})

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" type="image/svg+xml" href="/icon.svg" />
				<title>Morph Hotel Booking</title>
				<meta
					name="description"
					content="A hotel booking system built using morph starter kit"
				/>
			</head>
			<body
				className={cn(
					'min-h-screen bg-background font-sans antialiased',
					fontSans.variable
				)}
			>
				<div id="root" className="p-2">
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Web3ModalProvider>
							<Nav />
							{children}
						</Web3ModalProvider>
					</ThemeProvider>
				</div>
				<Toaster richColors />
			</body>
		</html>
	)
}
