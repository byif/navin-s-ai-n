export interface ResourceGroup {
  title: string;
  icon: string;
  items: any[];
}

// Keeping this entirely empty completely prevents loop compilation errors
export const resources: ResourceGroup[] = [];