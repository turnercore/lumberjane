import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Key } from '@/types';
import { useAuthContext } from '@/context';
import { decrypt } from '@/utils/crypto';


const KeyList = ({ keys, onDelete }: { keys: Key[], onDelete: (id: number) => void }) => {
  const { user } = useAuthContext();

  const handleShowKeyValue = async (key: Key) => {
    if (!user) return;
    const decryptedKey = await decrypt(key.key, user.id, '');
    key.value = decryptedKey;
    return key.value;
  };

  return (
    <List>
      {keys.map((key) => (
        <ListItem key={key.id}>
          <ListItemText 
            primary={key.name} 
            secondary={handleShowKeyValue(key)} 
          />
          <IconButton edge="end" onClick={() => onDelete(key.id)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default KeyList;