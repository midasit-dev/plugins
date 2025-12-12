import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';

const CustomTreeItem = styled((props) => <TreeItem {...props} />)(({ theme }) => ({
    [`& .${treeItemClasses.content}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
}));

const data = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
];

export const TreeTest = () => {
    const handleDelete = (id) => {
        console.log(`Delete item with id: ${id}`);
        // 여기에 삭제 로직을 추가하세요.
    };

    return (
        <TreeView
            aria-label="customized"
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<CloseSquare />}
        >
            {data.map((item) => (
                <CustomTreeItem
                    key={item.id}
                    nodeId={item.id}
                    label={
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                            {item.name}
                            <IconButton
                                aria-label="delete"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    }
                />
            ))}
        </TreeView>
    );
}

// Icons
function MinusSquare(props) {
    return (
        <span style={{ margin: 5, fontSize: 20 }} {...props}>
            -
        </span>
    );
}

function PlusSquare(props) {
    return (
        <span style={{ margin: 5, fontSize: 20 }} {...props}>
            +
        </span>
    );
}

function CloseSquare(props) {
    return (
        <span style={{ margin: 5, fontSize: 20 }} {...props}>
            x
        </span>
    );
}
