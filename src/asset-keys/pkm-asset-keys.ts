export const PKM_NAME_KEYS = Object.freeze({
  FLETCHINDER: 'FLETCHINDER',
  FLETCHLING: 'FLETCHLING'
} as const)

function makeAssetKeys<
  T extends Record<string, string>,
  P extends string
>(prefix: P, keys: T) {
  return Object.fromEntries(
    Object.values(keys).map((v) => [v, `${prefix}${v}`])
  ) as { [K in T[keyof T]]: `${P}${K}` }
}

export const PKM_FRONT_ASSET_KEYS = makeAssetKeys(
  'PKM_FRONT_',
  PKM_NAME_KEYS
)

export const PKM_BACK_ASSET_KEYS = makeAssetKeys(
  'PKM_BACK_',
  PKM_NAME_KEYS
)

export const PKM_ICON_ASSET_KEYS = makeAssetKeys(
  'PKM_ICON_',
  PKM_NAME_KEYS
)
