"use client"

import { useState } from "react"
import { useMenu, MenuItem } from "@/contexts/MenuContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Menu, Plus, Edit, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/components/AppLayout"

function ManageMenuContent() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu()
  const { toast } = useToast()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'top-dish' as MenuItem['category'],
    price: '',
    description: ''
  })

  const categories = [
    { value: 'top-dish', label: 'Top Dish', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    { value: 'other-dish', label: 'Other Dish', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    { value: 'top-drink', label: 'Top Drink', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    { value: 'other-drink', label: 'Other Drink', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
  ]

  const getCategoryLabel = (category: MenuItem['category']) => {
    return categories.find(c => c.value === category)?.label || category
  }

  const getCategoryColor = (category: MenuItem['category']) => {
    return categories.find(c => c.value === category)?.color || ''
  }

  const openAddDialog = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: 'top-dish',
      price: '',
      description: ''
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description || ''
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      })
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    const itemData = {
      name: formData.name.trim(),
      category: formData.category,
      price: price,
      description: formData.description.trim() || undefined
    }

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData)
      toast({
        title: "Item updated",
        description: `${itemData.name} has been updated successfully`,
      })
    } else {
      addMenuItem(itemData)
      toast({
        title: "Item added",
        description: `${itemData.name} has been added to the menu`,
      })
    }

    setIsDialogOpen(false)
  }

  const handleDelete = (item: MenuItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteMenuItem(item.id)
      toast({
        title: "Item deleted",
        description: `${item.name} has been removed from the menu`,
      })
    }
  }

  // Group items by category
  const groupedItems = categories.map(cat => ({
    ...cat,
    items: menuItems.filter(item => item.category === cat.value)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Menu Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Add, edit, or remove menu items</p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Menu Items by Category */}
        <div className="space-y-6">
          {groupedItems.map(group => (
            <Card key={group.value} className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Menu className="w-5 h-5" />
                  {group.label}
                  <Badge variant="outline" className="ml-auto">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No items in this category</p>
                    <Button
                      variant="link"
                      onClick={openAddDialog}
                      className="mt-2"
                    >
                      Add your first item
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Description</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Price</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map(item => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.description || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-green-600 dark:text-green-500">
                                €{item.price.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDialog(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(item)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the details of this menu item' : 'Enter the details for the new menu item'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Margherita Pizza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem['category'] })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the item"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function ManageMenu() {
  return (
    <AppLayout>
      <ManageMenuContent />
    </AppLayout>
  )
}
