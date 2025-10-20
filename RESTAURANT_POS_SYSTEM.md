# Restaurant POS & Menu Management System

## 🎯 Overview

A complete Point-of-Sale (POS) and Menu Management system integrated with your existing analytics dashboard. The system provides a modern, touch-friendly interface for restaurant staff to take orders and manage menu items.

## ✨ Features

### 1. **Persistent Sidebar Navigation**
- Always visible on the left side (64px width)
- Three main sections:
  - **Dashboard** - Analytics & Insights
  - **Order Station** - Take Orders (POS)
  - **Menu Management** - Edit Menu Items
- Active tab highlighted with green gradient
- User profile display
- Theme toggle (light/dark mode)
- Logout button

### 2. **Order Station (POS Interface)**
- **Route**: `/order-station`
- Touch-friendly card-based interface
- Four categories:
  - Top Dishes
  - Other Dishes
  - Top Drinks
  - Other Drinks
- Real-time order summary panel
- Features:
  - Click to add items
  - Adjust quantities (+/-)
  - Remove individual items
  - Clear entire order
  - Confirm order button
  - Running total price
  - Item counter
- Responsive grid layout
- Smooth animations and transitions

### 3. **Menu Management Interface**
- **Route**: `/manage-menu`
- Table view grouped by category
- CRUD operations:
  - **Add** new menu items
  - **Edit** existing items
  - **Delete** items (with confirmation)
- Modal dialog for add/edit:
  - Item name
  - Category dropdown
  - Price input
  - Description (optional)
- Data persisted in localStorage
- Default menu items included

### 4. **Updated Dashboard**
- Integrated with sidebar navigation
- Removed old header (now in sidebar)
- Cleaner layout with more space
- All existing analytics features preserved

## 📁 File Structure

```
shadcn/
├── components/
│   ├── Sidebar.tsx              # Persistent navigation sidebar
│   └── AppLayout.tsx            # Layout wrapper with sidebar
├── contexts/
│   └── MenuContext.tsx          # Menu data management
├── app/
│   ├── layout.tsx               # Updated with MenuProvider
│   ├── dashboard/
│   │   └── page.tsx             # Updated dashboard with AppLayout
│   ├── order-station/
│   │   └── page.tsx             # POS interface
│   └── manage-menu/
│       └── page.tsx             # Menu management
└── RESTAURANT_POS_SYSTEM.md     # This file
```

## 🚀 Getting Started

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to the Application

- **Login**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Order Station**: `http://localhost:3000/order-station`
- **Menu Management**: `http://localhost:3000/manage-menu`

### 3. Default Menu Items

The system comes with 16 pre-configured menu items:
- 4 Top Dishes (Pizza, Pasta, Salad, Burger)
- 4 Other Dishes (Salmon, Tikka, Stir Fry, Fish & Chips)
- 4 Top Drinks (Coca Cola, Orange Juice, Coffee, Beer)
- 4 Other Drinks (Water, Iced Tea, Wine, Smoothie)

## 💻 Usage Guide

### Order Station Workflow

1. **Navigate** to Order Station from sidebar
2. **Browse** menu items by category
3. **Click** on items to add them to the order
4. **Adjust** quantities using +/- buttons
5. **Review** order summary on the right
6. **Confirm** order when ready
7. Order clears automatically after confirmation

### Menu Management Workflow

1. **Navigate** to Menu Management from sidebar
2. **View** all items grouped by category
3. **Add New Item**:
   - Click "Add New Item" button
   - Fill in the form
   - Select category
   - Set price
   - Add description (optional)
   - Click "Add Item"
4. **Edit Item**:
   - Click edit button on any item
   - Modify details in modal
   - Click "Update Item"
5. **Delete Item**:
   - Click delete button
   - Confirm deletion

## 🎨 Design Features

### Color Scheme
- **Primary**: Green gradient (`from-green-500 to-green-600`)
- **Categories**:
  - Top Dishes: Orange
  - Other Dishes: Amber
  - Top Drinks: Blue
  - Other Drinks: Cyan

### UI Components (shadcn/ui)
- Card
- Button
- Input
- Textarea
- Select
- Dialog
- Badge
- Avatar
- Toast notifications

### Responsive Design
- Mobile-friendly
- Tablet-optimized (ideal for POS tablets)
- Desktop support
- Touch-friendly buttons and cards

### Dark Mode
- Full dark mode support
- Automatic theme switching
- Consistent styling across themes

## 🔧 Technical Details

### Menu Context

The `MenuContext` provides:
- `menuItems`: Array of all menu items
- `addMenuItem(item)`: Add new item
- `updateMenuItem(id, item)`: Update existing item
- `deleteMenuItem(id)`: Remove item
- `getItemsByCategory(category)`: Filter by category

### Data Persistence

- Menu items stored in `localStorage`
- Key: `menuItems`
- Automatically saves on changes
- Loads on app startup

### Menu Item Interface

```typescript
interface MenuItem {
  id: string
  name: string
  category: 'top-dish' | 'other-dish' | 'top-drink' | 'other-drink'
  price: number
  description?: string
}
```

### Order Item Interface

```typescript
interface OrderItem extends MenuItem {
  quantity: number
}
```

## 🔐 Authentication

- All pages protected by `AppLayout`
- Redirects to login if not authenticated
- User info displayed in sidebar
- Logout functionality in sidebar

## 📱 Mobile Responsiveness

### Sidebar
- Fixed width on desktop (64px)
- Responsive on mobile
- Collapsible (future enhancement)

### Order Station
- Grid adjusts to screen size
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop
- Sticky order summary

### Menu Management
- Horizontal scroll on small screens
- Full table on desktop
- Touch-friendly buttons

## 🎯 Future Enhancements

### Planned Features
- [ ] Order history tracking
- [ ] Print receipts
- [ ] Table management
- [ ] Split bills
- [ ] Discount codes
- [ ] Tax calculations
- [ ] Payment integration
- [ ] Kitchen display system
- [ ] Waiter assignments
- [ ] Real-time order updates
- [ ] Inventory management
- [ ] Customer database
- [ ] Loyalty program
- [ ] Analytics for orders
- [ ] Export reports

### Technical Improvements
- [ ] Backend API integration
- [ ] Database storage (replace localStorage)
- [ ] Real-time sync across devices
- [ ] Offline mode
- [ ] Image uploads for menu items
- [ ] Barcode/QR code scanning
- [ ] Multi-language support
- [ ] Currency selection
- [ ] Tax configuration
- [ ] Receipt customization

## 🐛 Troubleshooting

### Menu Items Not Saving
- Check browser localStorage is enabled
- Clear localStorage and reload: `localStorage.clear()`
- Check browser console for errors

### Sidebar Not Showing
- Verify `AppLayout` is wrapping the page
- Check authentication status
- Refresh the page

### Order Not Confirming
- Check toast notifications for errors
- Ensure items are in the order
- Check browser console

### Dark Mode Issues
- Toggle theme in sidebar
- Check system theme settings
- Clear browser cache

## 📊 Data Flow

```
User Action
    ↓
Component State
    ↓
MenuContext
    ↓
localStorage
    ↓
Re-render Components
```

## 🔄 State Management

### Global State (MenuContext)
- Menu items
- CRUD operations

### Local State (Components)
- Order items (Order Station)
- Form data (Menu Management)
- UI state (modals, loading)

### Persistent State
- localStorage for menu items
- Theme preference
- User session

## 🎨 Styling Guidelines

### Consistent Patterns
- Glass-morphism effects (`backdrop-blur`)
- Rounded corners (`rounded-lg`, `rounded-xl`)
- Shadows (`shadow-lg`, `shadow-xl`)
- Gradients for primary actions
- Smooth transitions (`transition-all duration-200`)

### Spacing
- Padding: `p-4`, `p-6`, `p-8`
- Gaps: `gap-2`, `gap-4`, `gap-6`
- Margins: `mb-4`, `mt-6`, `space-y-4`

### Typography
- Headings: `text-xl`, `text-2xl`, `text-3xl`
- Body: `text-sm`, `text-base`
- Font weights: `font-medium`, `font-semibold`, `font-bold`

## 📝 Code Examples

### Adding a Menu Item

```typescript
const { addMenuItem } = useMenu()

addMenuItem({
  name: 'New Dish',
  category: 'top-dish',
  price: 15.99,
  description: 'Delicious new dish'
})
```

### Creating an Order

```typescript
const [orderItems, setOrderItems] = useState<OrderItem[]>([])

const addToOrder = (item: MenuItem) => {
  setOrderItems(prev => {
    const existing = prev.find(i => i.id === item.id)
    if (existing) {
      return prev.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      )
    }
    return [...prev, { ...item, quantity: 1 }]
  })
}
```

### Calculating Total

```typescript
const totalPrice = orderItems.reduce(
  (sum, item) => sum + (item.price * item.quantity), 
  0
)
```

## 🌟 Best Practices

### Performance
- Use React.memo for expensive components
- Lazy load images
- Debounce search inputs
- Virtualize long lists

### Accessibility
- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

### Security
- Validate all inputs
- Sanitize data
- Protect routes
- Secure API calls

### Code Quality
- TypeScript for type safety
- ESLint for code style
- Prettier for formatting
- Component documentation

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Context](https://react.dev/reference/react/useContext)

### Icons
- [Lucide Icons](https://lucide.dev)

## 🤝 Contributing

### Adding New Features
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

### Code Style
- Follow existing patterns
- Use TypeScript
- Add comments for complex logic
- Keep components small and focused

## 📄 License

This project is part of the MenuInzicht Restaurant System.

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check browser console
4. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-12  
**Author**: MenuInzicht Development Team
