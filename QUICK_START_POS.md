# Quick Start Guide - Restaurant POS System

## 🚀 Get Started in 3 Minutes

### Step 1: Start the Server

```bash
cd shadcn
npm run dev
```

### Step 2: Login

1. Open `http://localhost:3000`
2. Login with your credentials
3. You'll see the new sidebar navigation

### Step 3: Explore the System

#### 📊 Dashboard (Analytics)
- Click "Dashboard" in the sidebar
- View all your restaurant analytics
- Same features as before, now with sidebar navigation

#### 🛒 Order Station (POS)
- Click "Order Station" in the sidebar
- Click on menu items to add to order
- Adjust quantities with +/- buttons
- Click "Confirm Order" when ready
- Order clears automatically

#### 📝 Menu Management
- Click "Menu Management" in the sidebar
- View all menu items in tables
- Click "Add New Item" to create items
- Click edit icon to modify items
- Click delete icon to remove items

## 🎯 Quick Tips

### Taking an Order
1. Navigate to Order Station
2. Click items from the menu grid
3. Use +/- to adjust quantities
4. Review total on the right
5. Click "Confirm Order"

### Adding a Menu Item
1. Navigate to Menu Management
2. Click "Add New Item" button
3. Fill in:
   - Name (required)
   - Category (required)
   - Price (required)
   - Description (optional)
4. Click "Add Item"

### Editing a Menu Item
1. Find the item in the table
2. Click the edit (pencil) icon
3. Modify the details
4. Click "Update Item"

## 🎨 Navigation

### Sidebar Features
- **Green highlight** = Active page
- **Theme toggle** = Switch light/dark mode
- **User profile** = Shows your name and email
- **Logout button** = Sign out

### Keyboard Shortcuts
- Click sidebar items to navigate
- Use Tab to navigate forms
- Enter to submit forms
- Escape to close modals

## 📱 Mobile Usage

### On Tablets (Recommended for POS)
- Sidebar stays visible
- Touch-friendly buttons
- Large tap targets
- Optimized for portrait/landscape

### On Phones
- Sidebar adapts to smaller screens
- Swipe-friendly interface
- Responsive grid layout

## 💡 Pro Tips

1. **Order Station**:
   - Items are grouped by category for easy finding
   - Click multiple times to add multiple quantities
   - Use the clear button to start over

2. **Menu Management**:
   - Items are automatically saved to localStorage
   - Changes appear immediately in Order Station
   - Delete confirmation prevents accidents

3. **Dashboard**:
   - All analytics features still work
   - Use date range selector for comparisons
   - Scroll down for detailed charts

## 🔧 Troubleshooting

### Can't see the sidebar?
- Make sure you're logged in
- Refresh the page (Cmd+R / Ctrl+R)

### Menu items not saving?
- Check localStorage is enabled in browser
- Try a different browser
- Clear cache and reload

### Order not confirming?
- Make sure you have items in the order
- Check for toast notifications
- Look for error messages

## 📊 Default Menu

The system comes with 16 items:

**Top Dishes** (Orange):
- Margherita Pizza - €12.50
- Pasta Carbonara - €14.00
- Caesar Salad - €10.50
- Beef Burger - €15.00

**Other Dishes** (Amber):
- Grilled Salmon - €18.50
- Chicken Tikka - €13.50
- Vegetable Stir Fry - €11.00
- Fish & Chips - €14.50

**Top Drinks** (Blue):
- Coca Cola - €3.50
- Fresh Orange Juice - €4.50
- Coffee - €3.00
- Beer - €5.00

**Other Drinks** (Cyan):
- Sparkling Water - €3.00
- Iced Tea - €3.50
- Red Wine - €6.50
- Smoothie - €5.50

## 🎯 Next Steps

1. **Customize your menu**:
   - Add your restaurant's actual items
   - Set correct prices
   - Add descriptions

2. **Train your staff**:
   - Show them the Order Station
   - Practice taking orders
   - Explain the categories

3. **Test the system**:
   - Take sample orders
   - Try different scenarios
   - Check all features work

## 📚 Need More Help?

- Read `RESTAURANT_POS_SYSTEM.md` for full documentation
- Check the code comments
- Look at component examples
- Contact support team

---

**Happy ordering! 🍽️**
