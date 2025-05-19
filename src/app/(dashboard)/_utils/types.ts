import {LucideIcon} from "lucide-react"

// Type for navigation sub-items
export type NavSubItem = {
    title: string
    url: string
}

// Type for main navigation items
export type NavItem = {
    title: string
    url: string
    icon: LucideIcon
    items?: NavSubItem[],
    initiallyExpanded?: boolean
}

// Type for guide items
export type GuideItem = {
    name: string
    url: string
    icon: LucideIcon
}

// Comprehensive type for the entire data structure
export type SidebarData = {
    navMain: NavItem[]
    guides?: GuideItem[]
}

// Usage example:
// const data: AppData = { ... }