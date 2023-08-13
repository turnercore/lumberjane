import React, { useEffect, useState } from 'react';
import { Input, DatePickerWithPresets, Popover, PopoverContent, PopoverTrigger, Command, CommandInput, CommandGroup, CommandItem, Button, Label, CheckboxWithDay } from "@/components/ui";

type RestrictionInputProps = {
  type: 'headerTags' | 'ipAddresses' | 'timeOfDay' | 'expirationDate';
  remove: () => void;
};

type RestrictionType = 'headerTags' | 'ipAddresses' | 'timeOfDay' | 'expirationDate';
type Restriction = {
  type: RestrictionType;
  data: Record<string, any>; // You can define a more specific type for data if needed
};

type RestrictionsDropdownProps = {
  onRestrictionsChange: (restrictionsObject: any) => void;
};

export default function RestrictionsDropdown({onRestrictionsChange}: RestrictionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [headerTags, setHeaderTags] = useState([]);
  const [ipAddresses, setIpAddresses] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);

  // Rebuild the restrictions object whenever any of the individual parts change
  useEffect(() => {
    const restrictions = {
      headerTags,
      ipAddresses,
      timeOfDay,
      expirationDate,
    };
    onRestrictionsChange(restrictions);
  }, [headerTags, ipAddresses, timeOfDay, expirationDate, onRestrictionsChange]);

  const addRestriction = (type: RestrictionType) => {
    if (type === 'expirationDate' && restrictions.some(r => r.type === 'expirationDate')) {
      // If an expiration date restriction is already present, do not add another one
      return;
    }
    setRestrictions([...restrictions, { type, data: {} }]);
  };

  const removeRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label className='text-xl'>Restrictions and Security (Optional)</Label>
      <div className='space-y-4'>
        {restrictions.map((restriction, index) => (
          <RestrictionInput
            key={index}
            type={restriction.type}
            remove={() => removeRestriction(index)}
          />
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button>+ Add New Restriction</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search restriction..." />
              <CommandGroup>
                <CommandItem onSelect={() => addRestriction('headerTags')}>Header Tags</CommandItem>
                <CommandItem onSelect={() => addRestriction('ipAddresses')}>IP Addresses</CommandItem>
                <CommandItem onSelect={() => addRestriction('timeOfDay')}>Time of Day</CommandItem>
                <CommandItem onSelect={() => addRestriction('expirationDate')}>Expiration Date</CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function RestrictionInput({ type, remove }: RestrictionInputProps) {
  switch (type) {
    case 'headerTags':
      return (
        <div className="flex items-center space-x-2">
          <Label>Header:</Label>
          <Input type="text" placeholder="Header" className="w-32" />
          <Label>Value:</Label>
          <Input type="text" placeholder="Value" className="w-32" />
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'ipAddresses':
      return (
        <div className="flex items-center space-x-2">
          <Label>IP Address Range (CIDR):</Label>
          <Input type="text" placeholder="192.168.1.0/24" className="w-32"/>
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'timeOfDay':
      return (
        <div className="flex items-center space-x-2">
          <Label>Usage Restricted During:</Label>
          <Input className='w-32' type="time" />
          <p> to </p>
          <Input className='w-32' type="time" />
          <div className="flex space-x-1 items-center">
            <CheckboxWithDay id="monday" label="M" />
            <CheckboxWithDay id="tuesday" label="T" />
            <CheckboxWithDay id="wednesday" label="W" />
            <CheckboxWithDay id="thursday" label="T" />
            <CheckboxWithDay id="friday" label="F" />
            <CheckboxWithDay id="saturday" label="S" />
            <CheckboxWithDay id="sunday" label="S" />
          </div>
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
      case 'expirationDate':
        return (
          <div className="flex items-center space-x-2">
            <Label>Expiration Date:</Label>
            <DatePickerWithPresets />
            <Button variant='destructive' onClick={remove}>-</Button>
          </div>
        );
    default:
      return null;
  }
}
