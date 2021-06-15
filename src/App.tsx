import "./styles.css";
import axios from "axios";
import { useEffect, useState } from "react";

// https://randomuser.me/api/?results=20

function getRandomUser() {
  return axios
    .get("https://randomuser.me/api/?results=100")
    .then((e) => {
      return e.data.results;
    })
    .catch((err) => console.log(err));
}

function flattenLocations(locations: any[]) {
  const data = locations.map(({ street, coordinates, timezone, ...rest }) => {
    return {
      ...rest,
      number: street.number,
      name: street.name,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    };
  });
  const flattenKeys = getObjectKeys(data[0]);
  return {
    headers: flattenKeys,
    data
  };
}

function getObjectKeys(data: any) {
  var listKeys = [];

  Object.keys(data).forEach((key) => {
    if (typeof data[key] !== "object") {
      listKeys.push(key);
    } else {
      listKeys = [...listKeys, ...getObjectKeys(data[key])];
    }
  });
  return listKeys;
}

function SearchInput(props) {
  const [input, setInput] = useState("");
  useEffect(() => {
    props.updateSearchData(input);
  }, [input]);
  return (
    <input
      placeholder="search"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );
}

export default function App() {
  const [dataTable, setDataTable] = useState(null);
  const [dataSearch, setDataSearch] = useState(null);
  const [sortingDirections, setSortingDirections] = useState({}); //rules

  const updateSearchData = (value) => {
    if (dataTable === null) return;
    const newDataSearch = dataTable.data.filter((item) => {
      return Object.values(item).some(
        (el) => String(el).toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    });
    setDataSearch({ headers: dataTable.headers, data: newDataSearch });
  };
  useEffect(() => {
    getRandomUser().then((dataSet) => {
      var dataToBeStored = flattenLocations(
        dataSet.map(({ location }) => location)
      );
      setDataTable(dataToBeStored);
      setDataSearch(dataToBeStored);
    });
  }, []);

  function sortColumnRule(ruleColumn) {
    switch (ruleColumn.direction) {
      case "ASCENDING":
        return {
          column: ruleColumn.column,
          direction: "DESCENDING"
        };
      case "DESCENDING":
        return {
          column: ruleColumn.column,
          direction: "ASCENDING"
        };
      default:
        return {
          column: ruleColumn.column,
          direction: "DESCENDING"
        };
    }
  }
  function compare(a, b) {
    var column = sortingDirections.column;
    if (sortingDirections.direction === "ASCENDING") {
      if (a[column] < b[column]) {
        return -1;
      }
      if (a[column] > b[column]) {
        return 1;
      }
    } else {
      if (a[column] > b[column]) {
        return -1;
      }
      if (a[column] < b[column]) {
        return 1;
      }
    }
    return 0;
  }
  function sortColumn(column) {
    //{column : "column",direction}
    if (!sortingDirections.hasOwnProperty("column")) {
      setSortingDirections({
        column: column,
        direction: "ASCENDING"
      });
    } else {
      setSortingDirections(sortColumnRule(sortingDirections));
    }
    const newData = JSON.parse(JSON.stringify(dataSearch));
    newData.data = newData.data.sort(compare);

    setDataSearch(newData);
  }

  return (
    <div className="App">
      <SearchInput updateSearchData={updateSearchData} />
      <table>
        <thead>
          <tr>
            {dataSearch &&
              dataSearch.headers.map((headerItem, index) => (
                <th key={index} onClick={() => sortColumn(headerItem)}>
                  {headerItem}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {dataSearch &&
            dataSearch.data.map((item, index2) => (
              <tr key={index2}>
                {dataSearch.headers.map((headerItem, index) => (
                  <td key={index}>{item[headerItem]}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
