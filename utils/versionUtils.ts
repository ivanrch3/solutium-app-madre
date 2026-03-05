
export interface VersionInfo {
    appId: string;
    version: string;
    build?: string;
    compatibleSatellites?: {
        minVersion: string;
    };
}

export type VersionStatus = 'compatible' | 'update_required' | 'incompatible' | 'offline' | 'unknown';

/**
 * Compares two SemVer strings (e.g., "1.2.0" vs "1.1.5")
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export const compareSemVer = (v1: string, v2: string): number => {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
};

export const getCompatibilityStatus = (_motherVersion: string, satelliteVersion: string, minRequired: string): VersionStatus => {
    // 1. If Satellite is older than Min Required -> INCOMPATIBLE (Red)
    if (compareSemVer(satelliteVersion, minRequired) < 0) {
        return 'incompatible';
    }
    
    // 2. If Satellite is newer than Mother (unlikely but possible) -> WARNING (Yellow)
    // Or if Mother is significantly newer (Major version diff) -> UPDATE_REQUIRED
    // For now, simple logic: if compatible but not equal, maybe just compatible?
    // Let's stick to: if it meets min requirements, it's compatible.
    
    return 'compatible';
};
