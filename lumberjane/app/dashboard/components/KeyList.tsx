import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Key } from '@/types';


const KeyList = ({ keys, onDelete }: { keys: Key[], onDelete: (id: number) => void }) => {
    return (
      <List>
        {keys.map((key) => (
          <ListItem key={key.id}>
            <ListItemText primary={key.name} secondary={key.description} />
            <IconButton edge="end" onClick={() => onDelete(key.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    );
  };

export default KeyList;