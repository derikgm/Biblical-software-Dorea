import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();
  
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const routePath = route.routeConfig?.path;
    return routePath === '' || routePath === 'main'; 
  }
  
  // 💾 Guardar la ruta
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const routePath = route.routeConfig?.path || '';
    console.log('💾 Guardando ruta:', routePath);
    this.storedRoutes.set(routePath, handle);
  }
  
  // 🔍 ¿Debemos restaurar la ruta?
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const routePath = route.routeConfig?.path || '';
    const canAttach = this.storedRoutes.has(routePath);
    console.log('🔍 ¿Restaurar ruta?', routePath, canAttach);
    return canAttach;
  }
  
  // 📂 Restaurar la ruta
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const routePath = route.routeConfig?.path || '';
    console.log('📂 Restaurando ruta:', routePath);
    return this.storedRoutes.get(routePath) || null;
  }
  
  // 🔍 ¿Debemos reusar la ruta?
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Reusar si es la misma ruta
    return future.routeConfig === curr.routeConfig;
  }
}