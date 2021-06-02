import React, {useState, useEffect} from 'react';
import MaterialTable from 'material-table';
import {Checkbox, Input} from '@material-ui/core';
import {getCampaignFilters, saveRanks} from '../../ApiUtility/ApiUtility';
import {CircularProgress} from '@material-ui/core';
import {Save} from '@material-ui/icons'

const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
    cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

function CarouselRankings(props){

    

    const [carouselData, setCarouselData] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const sortFilters = nextCarouselData => nextCarouselData.sort((a,b) => {
        if (a.sort_order == 0) return 1;
        if (b.sort_order == 0) return -1;
        else return a.sort_order - b.sort_order;
    });

    const handleCheckbox = (rowData) => {
       if(rowData.sort_order == 0) selectCheckBox(rowData);
       else deselectCheckbox(rowData);
    }

    const selectCheckBox = rowData => {
        let lastSortedIndex = carouselData.findIndex(x => x.sort_order == 0) - 1;
        let nextHighestSorted;
        if(lastSortedIndex > -1) nextHighestSorted = carouselData[lastSortedIndex].sort_order + 1;
        else nextHighestSorted = 1;
        let index = carouselData.findIndex(x => x.frame_id == rowData.frame_id);
        let nextCarouselData = JSON.parse(JSON.stringify(carouselData));
        nextCarouselData[index].sort_order = nextHighestSorted;
        nextCarouselData[index].delete = false;
        nextCarouselData.forEach(x => delete x.tableData);
        setCarouselData(sortFilters(nextCarouselData));
    }
    

    const deselectCheckbox = rowData => {
        let index = carouselData.findIndex(x => x.frame_id == rowData.frame_id);
        let nextCarouselData = JSON.parse(JSON.stringify(carouselData));
        nextCarouselData[index].sort_order = 0;
        nextCarouselData[index].delete = true;
        for(let i = index+1; i < nextCarouselData.length; i += 1){
            if(nextCarouselData[i].sort_order == 0) break;
            nextCarouselData[i].sort_order -= 1;
        }
        setCarouselData(sortFilters(nextCarouselData));
    }

    const handleInputChange = (e, rowData) => {
        let nextRank = e.target.value;
        let nextCarouselData = JSON.parse(JSON.stringify(carouselData));
        let nextRankIndex = nextCarouselData.findIndex(x => nextRank == x.sort_order);
        let currentIndex = nextCarouselData.findIndex(x => x.sort_order == rowData.sort_order);
        if(nextRank < rowData.sort_order) rankDown(nextRankIndex, currentIndex, nextCarouselData);
        else rankUp(nextRankIndex, currentIndex, nextCarouselData);
        nextCarouselData[currentIndex].sort_order = parseInt(nextRank);
        nextCarouselData.forEach(x => delete x.tableData);
        setCarouselData(sortFilters(nextCarouselData));
    }

    const rankDown = (nextRankIndex, currentIndex, nextCarouselData) => {
        for(let i = nextRankIndex; i <= currentIndex; i += 1){
            nextCarouselData[i].sort_order += 1;
        }
    }

    const rankUp = (nextRankIndex, currentIndex, nextCarouselData) => {
        for(let i = currentIndex; i <= nextRankIndex; i += 1){
            nextCarouselData[i].sort_order -= 1;
        }
    }

    const updateRanks = () => {
        let data = carouselData.filter(x => x.sort_order !== 0 || x.delete == true)
        .map(x => ({sort_order: x.sort_order, frame_id: x.frame_id}));
        setIsSaving(true);
        saveRanks(data).then(x => {
            setTimeout(e => setIsSaving(false), 1000)
        })
        .catch(x => {
            setTimeout(e => setIsSaving(false), 1000);
        });
    }

    useEffect(() => {
        getCampaignFilters(props.campaignId).then(setCarouselData);
    }, [])

    return(
        <div style={{position: 'relative'}}>
        {isSaving && <CircularProgress size={24} style={{position: 'absolute', top: '20px', zIndex:10}} />}
        <MaterialTable
            title="Rankings"
            options={{search: false, pageSize: 20, padding: 'dense'}}
            columns={[
                { title: 'Rank?', field: 'sort_order', filtering: false, ...table_styling,
                    render: rowData => (
                        <Checkbox 
                            className="ranking_checkbox"
                            checked={rowData.sort_order !== 0}
                            color="primary"
                            onChange={e => handleCheckbox(rowData)}
                        />
                    )
                },
                { title: 'Order', field: 'sort_order', filtering: false, ...table_styling, 
                    render: (rowData, i) => {
                        console.log("i: ", i);
                        return (
                        <Input 
                            defaultValue={rowData.sort_order == 0 ? "" : rowData.sort_order}
                            // value={rowData.sort_order}
                            className={`order_${rowData.tableData.id}`}
                            key={Math.random()}
                            onBlur={e => handleInputChange(e, rowData)}
                            disabled={rowData.sort_order == 0}
                        />
                    )}
                },
                { title: 'Filter Name', field: 'name', ...table_styling}
            ]}
            actions={[
                {
                    icon: 'save',
                    tooltip: 'Update Rankings',
                    isFreeAction: true,
                    onClick: (event) => {
                        updateRanks();
                    }
                }
            ]}
            data={carouselData}
        />
        </div>
    )
}

export default CarouselRankings;