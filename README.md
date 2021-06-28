# Graph App Core

Библиотека, предоставляющая удобный интерфейс для взаимодействия с СУБД «Neo4j».

# Установка
```bash
npm install graph-app-core
```

# Подготовка к использованию библиотеки
Прежде чем перейти к использованию библиотеки, необходимо выполнить серию специальных запросов к базе данных Neo4j.
## Ноды
```cypher
 CREATE (type:Type) SET type = {name: "Number", defaultValue: 0}
 CREATE (type:Type) SET type = {name: "String", defaultValue: ""}
```
## Ограничения
```cypher
CREATE CONSTRAINT unique_graph_id ON (graph:Graph) ASSERT graph.id IS UNIQUE
CREATE CONSTRAINT unique_class_in_graph ON (class:Class) ASSERT class._unique_key IS UNIQUE
CREATE CONSTRAINT unique_property_in_class ON (property:Property) ASSERT property._unique_key IS UNIQUE
```
## Индексы
```cypher
CREATE INDEX node_id FOR (node:Node) ON (node.id) 
```

### Ссылки:  
NPM — https://www.npmjs.com/package/graph-app-core
