import { tokenAbi } from './tokenAbi'
import { bookingAbi } from './bookingAbi'

const adminAddress = '0x41F669e9c3dCDBf71d2C60843BfDC47bCE257081'
const tokenAddress = '0x3694b20E27246725B472a0cB601D642f057e8fde'
const bookingAddress = '0xE82b4A48A333b09Cf279494A24B02A58dc104c3c'

const getImageByCategory = (category: string) => {
	switch (category) {
		case 'Presidential':
			return '/presidential.jpg'
		case 'Deluxe':
			return '/deluxe.jpg'
		case 'Suite':
			return '/suite.jpg'
		default:
			return '/suite.jpg'
	}
}

const getCategoryLabel = (category: number) => {
	switch (category) {
		case 0:
			return 'Presidential'
		case 1:
			return 'Deluxe'
		case 2:
			return 'Suite'
		default:
			return ''
	}
}

export {
	adminAddress,
	tokenAbi,
	tokenAddress,
	bookingAbi,
	bookingAddress,
	getImageByCategory,
	getCategoryLabel,
}
