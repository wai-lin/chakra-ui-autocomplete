/* eslint-disable prettier/prettier */
import * as React from 'react'
import { useCombobox, useMultipleSelection, UseMultipleSelectionProps } from 'downshift'
import matchSorter from 'match-sorter'
import Highlighter from 'react-highlight-words'
import useDeepCompareEffect from 'react-use/lib/useDeepCompareEffect'
import cc from 'classcat'
import ThemeProvider from '@chakra-ui/core/dist/ThemeProvider'
import FormLabel, { FormLabelProps } from '@chakra-ui/core/dist/FormLabel'
import Tag, { TagCloseButton, TagLabel } from '@chakra-ui/core/dist/Tag'
import Box, { BoxProps } from '@chakra-ui/core/dist/Box'
import Input, { InputProps } from '@chakra-ui/core/dist/Input'

import {
  Button,
  List, ListItem, ListIcon,
  Text,
  Stack,
} from '@chakra-ui/core'

function defaultOptionFilterFunc<T>(items: T[], inputValue: string) {
  return matchSorter(items, inputValue, { keys: ['value', 'label'] })
}

function defaultItemRenderer<T extends Item>(selected: T) {
  return selected.label
}


export interface Item {
  label: string
  value: string
}

export interface ChakraMultipleCreateProps<T extends Item> extends UseMultipleSelectionProps<T> {
  items: T[]
  placeholder: string
  label: string
  onCreateItem?: (item: T) => void
  itemRenderer?: (item: T) => string
  emptyState?: (inputValue: string) => React.ReactNode
  optionFilterFunc?: (items: T[], inputValue: string) => T[]
  inputStyleProps?: InputProps
  inputIconStyleProps?: InputProps
  tagStyleProps?: InputProps
  selectedIconProps?: InputProps
  menuStyleProps?: BoxProps
  labelStyleProps?: FormLabelProps


}

export const ChakraMultipleCreate = <T extends Item>(
  props: ChakraMultipleCreateProps<T>
): React.ReactElement<ChakraMultipleCreateProps<T>> => {
  const {
    items,
    optionFilterFunc = defaultOptionFilterFunc,
    itemRenderer = defaultItemRenderer,
    placeholder,
    label,
    menuStyleProps,
    onCreateItem,
    ...downshiftProps
  } = props

  /* States */
  const [isCreating, setIsCreating] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [inputItems, setInputItems] = React.useState<T[]>(items)

  /* Refs */
  const disclosureRef = React.useRef(null)

  /* Downshift Props */
  const { getSelectedItemProps, getDropdownProps, addSelectedItem, removeSelectedItem, selectedItems } = useMultipleSelection(downshiftProps)
  const selectedItemValues = selectedItems.map((item) => item.value)

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
    selectItem,
    setHighlightedIndex
  } = useCombobox({
    inputValue,
    selectedItem: undefined,
    items: inputItems,
    onInputValueChange: ({ inputValue, selectedItem }) => {
      const filteredItems = optionFilterFunc(items, inputValue || '')

      if (isCreating && filteredItems.length > 0) {
        setIsCreating(false)
      }

      if (!selectedItem) {
        setInputItems(filteredItems)
      }
    },
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges
      switch (type) {
        case useCombobox.stateChangeTypes.InputBlur:
          return {
            ...changes,
            isOpen: false
          }
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            highlightedIndex: state.highlightedIndex,
            inputValue,
            isOpen: true
          }
        case useCombobox.stateChangeTypes.FunctionSelectItem:
          return {
            ...changes,
            inputValue
          }
        default:
          return changes
      }
    },
    // @ts-ignore
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue || '')
          break
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            if (selectedItemValues.includes(selectedItem.value)) {
              removeSelectedItem(selectedItem)
            } else {
              if (onCreateItem && isCreating) {
                onCreateItem(selectedItem)
                setIsCreating(false)
                setInputItems(items)
                setInputValue('')
              } else {
                addSelectedItem(selectedItem)
              }
            }

            // @ts-ignore
            selectItem(null)
          }
          break
        default:
          break
      }
    }
  })

  React.useEffect(() => {
    if (inputItems.length === 0) {
      setIsCreating(true)
      // @ts-ignore
      setInputItems([{ label: `${inputValue}`, value: inputValue }])
      setHighlightedIndex(0)
    }
  }, [inputItems, setIsCreating, setHighlightedIndex, inputValue])

  useDeepCompareEffect(() => {
    setInputItems(items)
  }, [items])


  return (
    <ThemeProvider>
      <Stack>
        <FormLabel {...getLabelProps({})}>{label}</FormLabel>

        {/* ---------Stack with Selected Menu Tags above the Input Box--------- */}
        {selectedItems &&
          <Stack spacing={2} isInline>
            {selectedItems.map((selectedItem, index) => (
              <Tag key={`selected-item-${index}`} {...getSelectedItemProps({ selectedItem, index })}>
                <TagLabel>{selectedItem.label}</TagLabel>
                <TagCloseButton
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSelectedItem(selectedItem)
                  }}
                  aria-label='Remove menu selection badge'
                />
              </Tag>
            ))}
          </Stack>
        }
        {/* ---------Stack with Selected Menu Tags above the Input Box--------- */}

        {/* -----------Section that renders the input element ----------------- */}
        <Stack isInline {...getComboboxProps()}>
          <Input
            {...getInputProps(
              getDropdownProps({
                placeholder,
                onClick: isOpen ? () => { } : openMenu,
                onFocus: isOpen ? () => { } : openMenu,
                ref: disclosureRef
              })
            )}
          />
          <Button {...getToggleButtonProps()} aria-label='toggle menu'> &#8595; </Button>
        </Stack>
        {/* -----------Section that renders the input element ----------------- */}


        {/* -----------Section that renders the Menu Lists Component ----------------- */}
        <List as="ul" {...menuStyleProps} {...getMenuProps()}>
          {isOpen &&
            inputItems.map((item, index) => (
              <ListItem
                className={cc({
                  'p-2 text-sm bg-white border-b': true,
                  'bg-gray-100':
                    highlightedIndex === index
                })}
                key={`${item.value}${index}`}
                {...getItemProps({ item, index })}
              >
                {isCreating ? (
                  <Text>
                    <Box as="span">Create</Box>{' '}
                    <Box as="span">
                      {item.label}
                    </Box>
                  </Text>
                ) : (
                    <div>
                      {selectedItemValues.includes(
                        item.value
                      ) && (
                          <ListIcon
                            icon="check-circle" color="green.500"
                            role='img'
                            fontSize=".7rem"
                            aria-label='Selected'
                          />
                        )}
                      <Highlighter
                        autoEscape
                        searchWords={[inputValue || '']}
                        textToHighlight={itemRenderer(
                          item
                        )}
                      />
                    </div>
                  )}
              </ListItem>
            ))}
        </List>
        {/* ----------- End Section that renders the Menu Lists Component ----------------- */}

      </Stack>
    </ThemeProvider>
  )
}
