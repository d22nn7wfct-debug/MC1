export const en = {
  common: {
    appName: 'ElectroShop',
    appTagline: 'Electronics Catalog',
    loading: 'Loading…',

    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    retry: 'Try Again',
    edit: 'Edit',
    search: 'Search',
    reset: 'Reset',
    apply: 'Apply',
    yes: 'Yes',
    no: 'No',
    of: 'of',
    items: 'items',
  },

  header: {
    cart: 'Cart',
    cartUserView: "Customer's Cart",
    cartAriaLabel: 'Open cart',
    cartUserAriaLabel: "View customer's cart",
    filters: 'Filters',
    filtersAriaLabel: 'Open filters',
    addProduct: 'Add Product',
    addProductAriaLabel: 'Add a new product',
    orders: 'Orders',
    ordersAriaLabel: 'View all orders',
    myOrders: 'My Orders',
    myOrdersAriaLabel: 'View my orders',
    switchAccount: 'Switch Account',
    roleAdmin: 'Admin',
    roleUser: 'Customer',
    itemsInCart: '{{count}} item in cart',
    activeFilters: '{{count}} active filter',
  },

  role: {
    title: 'Welcome to ElectroShop',
    subtitle: 'Choose how you want to browse the store',
    customer: 'Continue as Customer',
    customerDescription: 'Browse the catalog, add items to your cart, and place orders',
    admin: 'Continue as Admin',
    adminDescription: 'Manage products, view all orders, and handle order statuses',
    demoNotice: 'This is a demo app — your role is stored locally and can be switched anytime',
  },

  catalog: {
    title: 'Shop Electronics',
    subtitle: 'Find the latest tech at great prices',
    loadingDictionaries: 'Loading store…',
    loadingProducts: 'Loading products…',
    loadingMore: 'Loading more…',
    endOfList: "You've reached the end",
    noResults: 'No items match your search',
    noResultsHint: 'Try adjusting your filters or clearing them to see all products.',
    loadFailed: "Couldn't load products",
    loadFailedDictionaries: 'Something went wrong',
    loadFailedDictionariesHint: "We couldn't load store data. Check your connection and try again.",
    loadMoreFailed: "Couldn't load more products",
  },

  filters: {
    title: 'Filters',
    searchLabel: 'Search',
    searchPlaceholder: 'Search products…',
    categoryLabel: 'Category',
    categoryAll: 'All Categories',
    brandLabel: 'Brand',
    brandAll: 'All Brands',
    brandDisabledHint: 'Brand filter is coming soon',
    priceLabel: 'Price, ₽',
    priceMinPlaceholder: 'Min',
    priceMaxPlaceholder: 'Max',
    priceMinAriaLabel: 'Minimum price',
    priceMaxAriaLabel: 'Maximum price',
    sortLabel: 'Sort by',
    sortNone: 'Featured',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNameAsc: 'Name: A to Z',
    sortNameDesc: 'Name: Z to A',
    closeAriaLabel: 'Close filters',
  },

  product: {
    addToCart: 'Add to Cart',
    addToCartAdmin: "Add to User's Cart",
    addToCartAdminTitle: "Add to user's cart (help with checkout)",
    inCart: 'In Cart ✓',
    outOfStock: 'Out of Stock',
    outOfStockShort: 'None',
    inStock: 'In Stock',
    inStockCount: 'In stock: {{count}}',
    unavailable: 'Unavailable',
    noImage: 'No image',
    onlyLeft: 'Only {{count}} left',
    edit: 'Edit',
    delete: 'Delete',
    rating: 'Rating',
    category: 'Category',
    brand: 'Brand',
    descriptionDemoBanner: 'Demo mode: description is fetched from an external source — translation pending',
  },

  cart: {
    title: 'Your Cart',
    titleAdmin: "User's Cart (Read-Only)",
    empty: 'Your cart is empty',
    emptyHint: 'Browse our catalog and add some products to get started.',
    keepShopping: 'Keep Shopping',
    subtotal: 'Subtotal',
    total: 'Total',
    itemCount: '{{count}} item',
    quantity: 'Qty',
    remove: 'Remove',
    removeAriaLabel: 'Remove {{name}} from cart',
    increaseAriaLabel: 'Increase quantity',
    decreaseAriaLabel: 'Decrease quantity',
    quantityAriaLabel: 'Quantity for {{name}}',
    placeOrder: 'Place Order',
    placingOrder: 'Placing order…',
    orderPlaced: 'Order placed successfully!',
    orderFailed: "Couldn't place your order. Please try again.",
    adminCannotOrder: 'Only customers can place orders. As an admin, you can prep the cart — the customer completes checkout themselves.',
    adminHelpText: "This is the customer's cart. You can help fill it and edit it: change quantities, remove items, or clear the cart.",
    maxStockReached: 'Only {{count}} available in stock',
    pricePerUnit: '{{price}} each',
    clearCart: 'Clear Cart',
  },

  orders: {
    titleAdmin: 'All Orders',
    titleUser: 'My Orders',
    emptyAdmin: 'No orders yet',
    emptyAdminHint: 'Orders placed by customers will appear here.',
    emptyUser: "You haven't placed any orders yet",
    emptyUserHint: 'Place your first order from the cart and it will show up here.',
    emptyFilteredAdmin: 'No orders match this status',
    emptyFilteredUser: 'You have no orders with this status',
    summaryCount: '{{count}} order',
    summaryTotal: 'totaling {{amount}}',
    orderNumber: 'Order {{id}}',
    placedOn: 'Placed on {{date}}',
    total: 'Total',
    statusLabel: 'Status',
    deleteOrder: 'Delete Order',
    deleteOrderConfirmTitle: 'Delete this order?',
    deleteOrderConfirmMessage: 'Order {{id}} for {{amount}} will be permanently deleted.',
    statusFilterAll: 'All',
    createdByAdmin: 'Admin',
    createdByUser: 'Customer',
    createdByAdminTitle: 'Created by admin on behalf of customer',
    createdByUserTitle: 'Created by customer',
    loadFailed: "Couldn't load orders",
    loading: 'Loading orders…',
    updateStatusFailed: "Couldn't update order status",
    deleteFailed: "Couldn't delete order",
  },

  orderStatus: {
    new: 'New',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },

  productForm: {
    titleCreate: 'Add New Product',
    titleEdit: 'Edit Product',
    nameLabel: 'Product Name',
    namePlaceholder: 'e.g. iPhone 15 Pro',
    priceLabel: 'Price (₽)',
    pricePlaceholder: '0',
    categoryLabel: 'Category',
    categoryPlaceholder: 'Select a category',
    brandLabel: 'Brand',
    brandPlaceholder: 'Select a brand',
    stockLabel: 'In Stock',
    stockPlaceholder: '0',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the product…',
    imageLabel: 'Image URL',
    imagePlaceholder: 'https://…',
    submitCreate: 'Create Product',
    submitEdit: 'Save Changes',
    submittingCreate: 'Creating…',
    submittingEdit: 'Saving…',
    deleteButton: 'Delete Product',
    deleteConfirmTitle: 'Delete this product?',
    deleteConfirmMessage: '"{{name}}" will be permanently removed from the catalog.',
    errors: {
      nameRequired: 'Product name is required',
      nameTooShort: 'Name must be at least 2 characters',
      priceRequired: 'Price is required',
      priceInvalid: 'Price must be a positive number',
      categoryRequired: 'Please select a category',
      brandRequired: 'Please select a brand',
      stockRequired: 'Stock quantity is required',
      stockInvalid: 'Stock must be 0 or more',
      submitFailed: "Couldn't save the product. Please try again.",
      deleteFailed: "Couldn't delete the product. Please try again.",
    },
  },

  confirm: {
    defaultTitle: 'Are you sure?',
    defaultConfirm: 'Confirm',
    defaultCancel: 'Cancel',
  },

  errors: {
    generic: 'Something went wrong',
    networkError: "We couldn't reach the server. Check your connection.",
    notFound: 'Not found',
    forbidden: "You don't have permission to do that",
    badRequest: 'Invalid request',
    serverError: 'Server error. Please try again later.',
    productNotFound: 'Product not found',
    orderNotFound: 'Order not found',
    cartEmpty: 'Your cart is empty',
    nameRequired: 'Name is required',
    pricePositive: 'Price must be positive',
    stockNonNegative: 'Stock cannot be negative',
    categoryRequired: 'Please select a category',
    brandRequired: 'Please select a brand',
    onlyUserCanOrder: 'Only customers can place orders',
    onlyAdminCanManage: 'Only admins can manage this',
  },

  language: {
    label: 'Language',
    russian: 'Русский',
    english: 'English',
    switchTo: 'Switch to {{lang}}',
  },
};

/**
 * Опциональные плюрализационные формы для i18next.
 * i18next автоматически выбирает суффикс (_one, _few, _many, _other)
 * на основе CLDR-правил для текущего языка.
 * Все формы опциональны — каждая локаль задаёт только нужные.
 */
interface PluralForms {
  header: {
    itemsInCart_one?: string;
    itemsInCart_few?: string;
    itemsInCart_many?: string;
    itemsInCart_other?: string;
    activeFilters_one?: string;
    activeFilters_few?: string;
    activeFilters_many?: string;
    activeFilters_other?: string;
  };
  cart: {
    itemCount_one?: string;
    itemCount_few?: string;
    itemCount_many?: string;
    itemCount_other?: string;
  };
  orders: {
    summaryCount_one?: string;
    summaryCount_few?: string;
    summaryCount_many?: string;
    summaryCount_other?: string;
  };
}

type MergeNamespaces<A, B> = {
  [K in keyof A]: K extends keyof B ? A[K] & B[K] : A[K];
};

export type Translations = MergeNamespaces<typeof en, PluralForms>;
