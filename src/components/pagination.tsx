// react
import React from "react";
// react virtual
import type { VirtualItem } from "@tanstack/react-virtual";
import { useVirtualizer } from "@tanstack/react-virtual";
// cn
import { cn } from "../utils/cn";
// components
import * as PopoverPrimitive from "@radix-ui/react-popover";

type PaginationItem = number | number[];

const createContinuousNumArray = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const calculatePagination = (
  total: number,
  currPage: number
): PaginationItem[] => {
  if (total < 10) return createContinuousNumArray(1, total);
  if (currPage < 4 || currPage > total - 3) {
    return [
      ...createContinuousNumArray(1, 4),
      createContinuousNumArray(5, total - 4),
      ...createContinuousNumArray(total - 3, total),
    ];
  }
  return [
    1,
    createContinuousNumArray(2, currPage - 3),
    ...createContinuousNumArray(currPage - 2, currPage + 2),
    createContinuousNumArray(currPage + 3, total - 1),
    total,
  ];
};

interface PaginationProps {
  total: number;
  currPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ total, currPage, onPageChange }: PaginationProps) => {
  const [pagination, setPagination] = React.useState<PaginationItem[]>(() =>
    calculatePagination(total, currPage)
  );

  const handlePrev = () => {
    if (currPage > 1) {
      const newCurrPage = currPage - 1;
      onPageChange(newCurrPage);
      setPagination(calculatePagination(total, newCurrPage));
    }
  };

  const handleNext = () => {
    if (currPage < total) {
      const newCurrPage = currPage + 1;
      onPageChange(newCurrPage);
      setPagination(calculatePagination(total, newCurrPage));
    }
  };

  const handlePage = (page: number) => {
    onPageChange(page);
    setPagination(calculatePagination(total, page));
  };

  return (
    <div className="flex text-sm">
      {/* previous */}
      <button
        disabled={currPage === 1}
        className={cn(
          "mr-1 rounded-lg border border-gray-200 p-[5px]",
          "disabled:cursor-not-allowed disabled:border-gray-50 disabled:bg-gray-25"
        )}
        onClick={handlePrev}
      >
        &lt;
      </button>
      {/* pages */}
      {pagination.map((item, i) => {
        const isShowMoreMenuPopover = Array.isArray(item);
        return (
          <React.Fragment key={i}>
            {/* other plan page button */}
            {!isShowMoreMenuPopover && (
              <PageButton
                page={item}
                currPage={currPage}
                onPageChange={handlePage}
              />
            )}
            {/* other plan sub pagination popover button */}
            {isShowMoreMenuPopover && (
              <ShowMoreMenu subPagination={item} onPageChange={handlePage} />
            )}
          </React.Fragment>
        );
      })}
      {/* next */}
      <button
        disabled={currPage === total}
        className={cn(
          "ml-1 rounded-lg border border-gray-200 p-[5px]",
          "disabled:cursor-not-allowed disabled:border-gray-50 disabled:bg-gray-25"
        )}
        onClick={handleNext}
      >
        &gt;
      </button>
    </div>
  );
};

interface PageButtonProps {
  page: number;
  currPage: number;
  onPageChange: (page: number) => void;
}

const PageButton = ({ page, currPage, onPageChange }: PageButtonProps) => {
  return (
    <button
      role="page-button"
      className={cn(
        "mx-1 h-9 w-9 rounded-lg",
        "hover:text-orange-450",
        { "border border-orange-400 text-orange-400": currPage === page },
        { "border-none bg-transparent": currPage !== page }
      )}
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  );
};

interface ShowMoreMenuProps {
  subPagination: Array<number>;
  onPageChange: (page: number) => void;
  isTriggerDisabled?: boolean;
}

const ShowMoreMenu = ({
  subPagination,
  onPageChange,
  isTriggerDisabled = false,
}: ShowMoreMenuProps) => {
  // pages dropdown menu
  const [showPagesMenu, setShowPagesMenu] = React.useState<boolean>(false);

  const handleShowPageMenu = () => {
    if (subPagination.length === 0) return;
    setShowPagesMenu((prev) => !prev);
  };

  const pages = React.useMemo(() => {
    return subPagination.sort((a, b) => a - b);
  }, [subPagination]);

  return (
    <PopoverPrimitive.Root
      open={showPagesMenu}
      onOpenChange={handleShowPageMenu}
    >
      <PopoverPrimitive.Trigger
        disabled={isTriggerDisabled}
        className={cn(
          "mx-1 flex h-9 w-9 items-center justify-center border-none bg-transparent pb-2",
          "hover:text-orange-450",
          "disabled:cursor-not-allowed disabled:text-gray-250"
        )}
      >
        ...
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={4}
          side="top"
          className="z-[--popover-zindex] rounded-lg bg-white p-1 shadow-lg"
        >
          <VirtualPageButtons pages={pages} onPageChange={onPageChange} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

interface VirtualPageButtonsProps {
  pages: number[];
  onPageChange: (page: number) => void;
}

const VirtualPageButtons = ({
  pages,
  onPageChange,
}: VirtualPageButtonsProps) => {
  // The scrollable element for your list
  const parentElRef = React.useRef<HTMLDivElement | null>(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => parentElRef.current,
    // button size (height): 40px
    estimateSize: () => 40,
  });

  return (
    <div
      ref={parentElRef}
      className="flex max-h-[186px] w-[58px] flex-col overflow-y-auto"
    >
      <div
        className="relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <VirtualPageButton
            key={virtualItem.key}
            virtualItem={virtualItem}
            pages={pages}
            onPageChange={onPageChange}
          />
        ))}
      </div>
    </div>
  );
};

interface VirtualPageButtonProps {
  virtualItem: VirtualItem;
  pages: number[];
  onPageChange: (page: number) => void;
}

const VirtualPageButton = ({
  virtualItem,
  pages,
  onPageChange,
}: VirtualPageButtonProps) => {
  const { size, start, index } = virtualItem;
  const page = pages[index];

  return (
    <button
      role="page-button"
      className="absolute inset-0 mx-1 bg-transparent px-4 py-2.5 text-sm"
      style={{
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      }}
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  );
};

export { Pagination };
