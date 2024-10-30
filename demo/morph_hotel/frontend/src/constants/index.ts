import { tokenAbi } from './tokenAbi'
import { bookingAbi } from './bookingAbi'

const adminAddress = '0x41F669e9c3dCDBf71d2C60843BfDC47bCE257081'
const tokenAddress = '0x2FdA6C948f815Cf9D2492B60D69f1F9FBFAF0EF2'
const bookingAddress = '0x0B3C2f534D33d16B7B0e89056ECb46C1cA966369'

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
