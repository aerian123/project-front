import type { PropsWithChildren } from 'react'
import styles from './Grid.module.css'

type GridColumns = 'single' | 'two' | 'three'

type GridProps = PropsWithChildren<{
  columns?: GridColumns
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}>

const columnClassMap: Record<GridColumns, string> = {
  single: styles.single,
  two: styles.two,
  three: styles.three,
}

const gapClassMap: Record<NonNullable<GridProps['gap']>, string> = {
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
}

export const Grid = ({
  children,
  columns = 'single',
  gap = 'md',
  className = '',
}: GridProps) => {
  const classes = [styles.grid, columnClassMap[columns], gapClassMap[gap], className]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}

export default Grid
