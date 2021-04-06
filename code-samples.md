---
layout: default
title: Code Samples
subtitle: 
---
### Outline
- [Outline](#outline)
- [GridManager.cs](#gridmanagercs)

### GridManager.cs

A singleton class that is designed from the ground-up to inform all `Unit` entities of their locations as well as solve hefty algorithms using simple int array representations. Utilizes generics where possible to create more robust and applicable code.
``` 
public class GridManager : SingletonDDOL<GridGraph>
{

    ...
        
    public T CheckForComponentOnTile<T>(Vector3 location) where T : Component
    {
        return GetNode(location).CheckForComponent<T>();
    } 
    private Node GetNode(Vector3 location)
    {
        return grid?[(int)location.x, (int)location.z];
    } 
    public List<Vector2> GetAllLocationsOfComponents<T>() where T : Component
    {
        List<Vector2> locations = new List<Vector2>();

        T temp;

        foreach(Node node in grid)
        {
            temp = node.CheckForComponent<T>();
            if (temp)
                locations.Add(node.Position);
        }

        return locations;
    }

    ...
```
`Unit` entities subscribe themselves to the `GridManager` upon activation and unsubscribe before being destroyed.
```
    ...

    public void UpdatePosition(Unit unit, Vector3 position, Vector3 newLocation)
    {
        GetNode(GetValidLocation(position)).RemoveGridUnit(unit);
        GetNode(GetValidLocation(newLocation)).AddGridUnit(unit);
    }
    public void AddUnitToGrid(Unit unit, Vector3 position)
    {
        GetNode(position)?.AddGridUnit(unit);
    }    
    public void RemoveUnitFromGrid(Unit unit, Vector3 position)
    {
        GetNode(position)?.RemoveGridUnit(unit);
    }

    ...

}
```