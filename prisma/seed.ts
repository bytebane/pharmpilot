import { PrismaClient, Role } from '../src/generated/prisma'
import * as argon2 from 'argon2'
import { categoriesData, itemsData, reportCategoriesData, suppliersData } from './constants'

const prisma = new PrismaClient()

async function main() {
	console.log('Started seeding ...')

	// --- Seed Super Admin ---
	const superAdminEmail = process.env.APP_SUPER_ADMIN_EMAIL || 'superadmin@example.com'
	const superAdminPassword = process.env.APP_SUPER_ADMIN_PASSWORD || 'superStrongPass123!'
	const superAdminName = process.env.APP_SUPER_ADMIN_NAME || 'Super Administrator'

	if (!process.env.APP_SUPER_ADMIN_EMAIL || !process.env.APP_SUPER_ADMIN_PASSWORD || !process.env.APP_SUPER_ADMIN_NAME) {
		console.warn('Warning: Kindly add APP_SUPER_ADMIN_EMAIL, APP_SUPER_ADMIN_PASSWORD, and APP_SUPER_ADMIN_NAME for seeding. Using default credentials for seeding. PLEASE CHANGE THESE FOR PRODUCTION.')
	}

	const existingSuperAdmin = await prisma.user.findUnique({
		where: { email: superAdminEmail },
	})

	if (!existingSuperAdmin) {
		const hashedSuperAdminPassword = await argon2.hash(superAdminPassword, {
			type: argon2.argon2id,
			memoryCost: 2 ** 16,
			timeCost: 3,
			parallelism: 1,
		})
		const superAdmin = await prisma.user.create({
			data: {
				email: superAdminEmail,
				name: superAdminName,
				firstName: superAdminName.split(' ')[0],
				lastName: superAdminName.split(' ').slice(1).join(' '),
				passwordHash: hashedSuperAdminPassword,
				role: Role.SUPER_ADMIN,
				isActive: true,
				emailVerified: new Date(),
			},
		})
		console.log(`Super Admin "${superAdmin.name}" created with email ${superAdmin.email}`)
	} else {
		console.log(`Super Admin with email ${superAdminEmail} already exists.`)
	}

	// --- Seed Admin ---
	const adminEmail = process.env.APP_ADMIN_EMAIL || 'admin@pharmpilot.local'
	const adminPassword = process.env.APP_ADMIN_PASSWORD || 'admin1234'
	const adminName = process.env.APP_ADMIN_NAME || 'Admin User'
	if (!process.env.APP_ADMIN_EMAIL || !process.env.APP_ADMIN_PASSWORD || !process.env.APP_ADMIN_NAME) {
		console.warn('Warning: Kindly add APP_ADMIN_EMAIL, APP_ADMIN_PASSWORD, and APP_ADMIN_NAME for seeding. Using default credentials for seeding. PLEASE CHANGE THESE FOR PRODUCTION.')
	}
	const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
	if (!existingAdmin) {
		const hashedAdminPassword = await argon2.hash(adminPassword, {
			type: argon2.argon2id,
			memoryCost: 2 ** 16,
			timeCost: 3,
			parallelism: 1,
		})
		await prisma.user.create({
			data: {
				email: adminEmail,
				name: adminName,
				firstName: adminName.split(' ')[0],
				lastName: adminName.split(' ').slice(1).join(' '),
				passwordHash: hashedAdminPassword,
				role: Role.ADMIN,
				isActive: true,
				emailVerified: new Date(),
			},
		})
		console.log(`Admin user created with email ${adminEmail}`)
	} else {
		console.log(`Admin user with email ${adminEmail} already exists.`)
	}

	// --- Seed Customer ---
	const customerEmail = process.env.APP_CUSTOMER_EMAIL || 'customer@pharmpilot.local'
	const customerPassword = process.env.APP_CUSTOMER_PASSWORD || 'customer1234'
	const customerName = process.env.APP_CUSTOMER_NAME || 'Customer User'
	if (!process.env.APP_CUSTOMER_EMAIL || !process.env.APP_CUSTOMER_PASSWORD || !process.env.APP_CUSTOMER_NAME) {
		console.warn('Warning: Kindly add APP_CUSTOMER_EMAIL, APP_CUSTOMER_PASSWORD, and APP_CUSTOMER_NAME for seeding. Using default credentials for seeding. PLEASE CHANGE THESE FOR PRODUCTION.')
	}
	const existingCustomer = await prisma.user.findUnique({ where: { email: customerEmail } })
	if (!existingCustomer) {
		const hashedCustomerPassword = await argon2.hash(customerPassword, {
			type: argon2.argon2id,
			memoryCost: 2 ** 16,
			timeCost: 3,
			parallelism: 1,
		})
		await prisma.user
			.create({
				data: {
					email: customerEmail,
					name: customerName,
					firstName: customerName.split(' ')[0],
					lastName: customerName.split(' ').slice(1).join(' '),
					passwordHash: hashedCustomerPassword,
					role: Role.CUSTOMER,
					isActive: true,
					emailVerified: new Date(),
				},
			})
			.then(async user => {
				await prisma.customer.create({
					data: {
						userId: user.id,
						name: user.name || '',
						email: user.email || '',
						address: '123 Main St',
					},
				})
			})
		console.log(`Customer user created with email ${customerEmail}`)
	} else {
		console.log(`Customer user with email ${customerEmail} already exists.`)
	}

	const suppliers = []
	const categories = []

	// --- Seed Suppliers ---

	console.log('Seeding suppliers...')
	for (const s of suppliersData) {
		const supplier = await prisma.supplier.upsert({
			where: { email: s.email },
			update: {},
			create: s,
		})
		suppliers.push(supplier)
	}

	// --- Seed Categories ---

	console.log('Seeding categories...')
	for (const c of categoriesData) {
		const category = await prisma.category.upsert({
			where: { name: c.name },
			update: {},
			create: c,
		})
		categories.push(category)
	}

	// --- Seed Report Categories ---

	console.log('Seeding report categories...')
	for (const rc of reportCategoriesData) {
		await prisma.reportCategory.upsert({
			where: { name: rc.name },
			update: {},
			create: rc,
		})
	}

	// --- Seed Items ---

	const data = console.log('Seeding items...')
	for (const item of itemsData) {
		const supplier = suppliers.find(s => s.name === item.supplierName)
		const categoryIds = categories.filter(c => item.categoryNames.includes(c.name)).map(c => ({ id: c.id }))
		const data = {
			name: item.name,
			manufacturer: item.manufacturer,
			generic_name: item.generic_name,
			formulation: item.formulation,
			strength: item.strength,
			unit: item.unit,
			schedule: item.schedule,
			description: item.description,
			units_per_pack: item.units_per_pack,
			price: item.price,
			tax_rate: item.tax_rate,
			discount: item.discount,
			reorder_level: item.reorder_level,
			quantity_in_stock: item.quantity_in_stock,
			expiry_date: item.expiry_date,
			purchase_price: item.purchase_price || item.price, // Use purchase_price if available, fallback to price
			purchase_date: item.purchase_date,
			isActive: item.isActive,
			isAvailable: item.isAvailable,
			supplier: supplier ? { connect: { id: supplier.id } } : undefined,
			categories: { connect: categoryIds },
		}
		// Try to find existing item by name (since name is not unique)
		const existingItem = await prisma.item.findFirst({
			where: { name: item.name },
			select: { id: true },
		})

		await prisma.item.upsert({
			where: { id: existingItem?.id ?? '' }, // If not found, use empty string (will create)
			update: { ...data },
			create: { ...data },
		})
	}
	console.log('Seeding finished.')
}

main()
	.catch(e => {
		console.error('Error during seeding:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
