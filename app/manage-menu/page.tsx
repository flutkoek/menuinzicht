"use client"

import { useState } from "react"
import { useMenu, MenuItem, MenuItemVariant } from "@/contexts/MenuContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Menu, Plus, Edit, Trash2, Save, X, Utensils, Coffee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/components/AppLayout"
import FeedbackSection from "@/components/FeedbackSection"

interface VariantFormData {
  id: string
  name: string
  priceModifier: string
}

function ManageMenuContent() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu()
  const { toast } = useToast()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'top-dish' as MenuItem['category'],
    price: '',
    description: '',
  })
  const [variants, setVariants] = useState<VariantFormData[]>([])

  const categories = [
    { value: 'top-dish', label: 'Top Dish', icon: Utensils, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', borderColor: 'border-orange-300 dark:border-orange-700' },
    { value: 'other-dish', label: 'Other Dish', icon: Utensils, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', borderColor: 'border-amber-300 dark:border-amber-700' },
    { value: 'top-drink', label: 'Top Drink', icon: Coffee, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', borderColor: 'border-blue-300 dark:border-blue-700' },
    { value: 'other-drink', label: 'Other Drink', icon: Coffee, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', borderColor: 'border-cyan-300 dark:border-cyan-700' },
  ]

  const getCategoryData = (category: MenuItem['category']) => {
    return categories.find(c => c.value === category) || categories[0]
  }

  const openAddDialog = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: 'top-dish',
      price: '',
      description: '',
    })
    setVariants([])
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description || '',
    })
    setVariants(
      item.variants?.map(v => ({
        id: v.id,
        name: v.name,
        priceModifier: v.priceModifier.toString()
      })) || []
    )
    setIsDialogOpen(true)
  }

  const addVariant = () => {
    setVariants(prev => [...prev, {
      id: `v${Date.now()}`,
      name: '',
      priceModifier: '0'
    }])
  }

  const updateVariant = (index: number, field: 'name' | 'priceModifier', value: string) => {
    setVariants(prev => prev.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
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

    // Validate variants
    const validVariants = variants.filter(v => v.name.trim())
    for (const variant of validVariants) {
      const modifier = parseFloat(variant.priceModifier)
      if (isNaN(modifier)) {
        toast({
          title: "Error",
          description: `Invalid price modifier for variant "${variant.name}"`,
          variant: "destructive",
        })
        return
      }
    }

    const itemData = {
      name: formData.name.trim(),
      category: formData.category,
      price: price,
      description: formData.description.trim() || undefined,
      variants: validVariants.length > 0 ? validVariants.map(v => ({
        id: v.id,
        name: v.name.trim(),
        priceModifier: parseFloat(v.priceModifier)
      })) : undefined
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Menu Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Add, edit, or remove menu items and their variants</p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Menu Items by Category */}
        <div className="space-y-6">
          {groupedItems.map(group => (
            <Card key={group.value} className="bg-white dark:bg-gray-800 shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${group.color}`}>
                    <group.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl">{group.label}</span>
                  <Badge variant="outline" className="ml-auto text-sm">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {group.items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Menu className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No items in this category</p>
                    <Button
                      variant="link"
                      onClick={openAddDialog}
                      className="mt-2 text-green-600"
                    >
                      Add your first item
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {group.items.map(item => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {item.name}
                              </h3>
                              <span className="text-xl font-bold text-green-600 dark:text-green-500">
                                €{item.price.toFixed(2)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {item.description}
                              </p>
                            )}
                            {item.variants && item.variants.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Variants:
                                </span>
                                {item.variants.map(variant => (
                                  <Badge
                                    key={variant.id}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {variant.name}
                                    {variant.priceModifier > 0 && (
                                      <span className="ml-1 text-green-600">+€{variant.priceModifier.toFixed(2)}</span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(item)}
                              className="hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900 hover:border-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the details of this menu item' : 'Enter the details for the new menu item'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Margherita Pizza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem['category'] })}
                >
                  <SelectTrigger id="category" className="text-base">
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
                <Label htmlFor="price" className="text-sm font-semibold">Base Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the item"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-base resize-none"
                />
              </div>

              {/* Variants Section */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Variants (optional)</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Add different options like sizes, flavors, or types
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={addVariant}
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>

                {variants.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Variant name (e.g., Large, Peach, Espresso)"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            className="text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              Price +/-:
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={variant.priceModifier}
                              onChange={(e) => updateVariant(index, 'priceModifier', e.target.value)}
                              className="text-sm"
                            />
                            <span className="text-xs text-gray-500">€</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 mt-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
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

        {/* Floating Add Button */}
        <Button
          onClick={openAddDialog}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-110 z-50"
          size="icon"
        >
          <Plus className="w-8 h-8" />
        </Button>

        {/* Feedback Section */}
        <FeedbackSection />
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
