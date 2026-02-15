// components/ui/combobox.tsx
import { useState, useRef, useEffect } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Option = {
	value: string;
	label: string;
	render?: React.ReactNode;
};

interface ComboboxProps {
	value: string;
	onValueChange: (value: string) => void;
	options: Option[];
	isLoading?: boolean;
	label?: string;
	error?: string;
	placeholder?: string;
	searchPlaceholder?: string;
	id?: string;
	required?: boolean;
	className?: string;
	disabled?: boolean;
	onCreate?: (term: string) => Promise<string | null>;
	emptyText?: string;
}

export function Combobox({
	value,
	onValueChange,
	options,
	isLoading = false,
	label,
	error,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	id,
	required = false,
	className,
	disabled = false,
	onCreate,
	emptyText = "No results found.",
}: ComboboxProps) {
	const [open, setOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [triggerWidth, setTriggerWidth] = useState(0);

	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (open && triggerRef.current) {
			setTriggerWidth(triggerRef.current.offsetWidth);
		}
	}, [open]);

	const selectedOption = options.find((option) => option.value === value);

	return (
		<div className={cn("grid gap-2", className)}>
			{label && (
				<Label htmlFor={id}>
					{label}
					{required && <span className="text-red-500">*</span>}
				</Label>
			)}
			<Popover
				open={open && !disabled}
				onOpenChange={(newOpen) => !disabled && setOpen(newOpen)}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						variant="outline"
						role="combobox"
						id={id}
						aria-expanded={open && !disabled}
						disabled={disabled}
						className={cn(
							"w-full justify-between bg-gray-100 cursor-pointer",
							error ? "border-destructive focus-visible:ring-destructive" : "",
							disabled && "opacity-50 cursor-not-allowed",
						)}>
						{selectedOption ? (
							<span className="text-ellipsis">
								{selectedOption.render || selectedOption.label}
							</span>
						) : (
							<span className="text-muted-foreground text-ellipsis">
								{placeholder}
							</span>
						)}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="p-0" style={{ width: triggerWidth }} sideOffset={4}>
					<Command>
						<CommandInput
							placeholder={searchPlaceholder}
							value={searchValue}
							onValueChange={setSearchValue}
							disabled={isLoading || disabled}
						/>
						<CommandList>
							<CommandEmpty className="py-6">
								{isLoading ? (
									<span>Loading...</span>
								) : onCreate && searchValue.trim() ? (
									<Button
										variant="link"
										size="sm"
										type="button"
										className="h-auto p-0 text-sm cursor-pointer"
										onClick={async () => {
											const newValue = await onCreate(searchValue.trim());
											if (newValue) {
												onValueChange(newValue);
												setOpen(false);
												setSearchValue("");
											}
										}}>
										Create "{searchValue.trim()}"
									</Button>
								) : searchValue.trim() ? (
									<p className="text-center px-4 text-sm">"No results found."</p>
								) : (
									<p className="text-center px-4 text-sm text-muted-foreground">
										{emptyText}
									</p>
								)}
							</CommandEmpty>
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										key={option.value}
										value={option.label}
										onSelect={() => {
											if (!disabled) {
												onValueChange(option.value);
												setOpen(false);
											}
										}}
										className={cn(
											disabled && "pointer-events-none opacity-50",
										)}>
										<Check
											className={cn(
												" h-4 w-4",
												value === option.value
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										{option.render || option.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{error && <p className="text-sm text-destructive mt-1">{error}</p>}
		</div>
	);
}
