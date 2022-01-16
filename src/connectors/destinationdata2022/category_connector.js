const _ = require("lodash");
const dbFn = require("../../db/functions");
const { ResourceConnector } = require("./resource_connector");
const { Category } = require("../../model/destinationdata2022/category");

const { schemas } = require("../../db");
const { abstracts, descriptions, names, shortNames, urls } = schemas;

class CategoryConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(category) {
    return this.runTransaction(() => this.insertCategory(category).then((id) => this.retrieveCategory(id)));
  }

  retrieve(id) {
    const categoryId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveCategory(categoryId));
  }

  update(category) {
    return this.runTransaction(() =>
      this.retrieveCategory(category.id).then((oldCategory) => this.updateCategory(oldCategory, category))
    );
  }

  delete(id) {
    const categoryId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteCategory(categoryId));
  }

  retrieveCategory(id) {
    return dbFn.selectCategoryFromId(this.connection, id).then((rows) => {
      if (_.isString(id)) {
        if (_.size(rows) === 1) {
          return this.mapRowToCategory(_.first(rows));
        }
        throw new Error("Not found");
      } else {
        return rows?.map(this.mapRowToCategory);
      }
    });
  }

  updateCategory(oldCategory, newInput) {
    const newCategory = _.create(oldCategory, newInput);

    this.checkLastUpdate(oldCategory, newCategory);

    if (this.shouldUpdate(oldCategory, newCategory)) {
      const columns = this.mapCategoryToColumns(newCategory);

      return dbFn
        .updateCategory(this.connection, columns)
        .then((ret) => {
          newCategory.resource_id = _.first(ret)?.resource_id;
          return Promise.all([
            this.updateResource(newCategory),
            this.updateCategoryCoveredTypes(newCategory),
            this.updateChildrenCategories(newCategory),
            this.updateParentCategories(newCategory),
          ]);
        })
        .then(() => newCategory);
    }

    this.throwNoUpdate(oldCategory);
  }

  deleteCategory(id) {
    return dbFn.deleteCategory(this.connection, id);
  }

  insertCategory(category) {
    return this.insertResource(category)
      .then((resourceId) => {
        const columns = this.mapCategoryToColumns(category, resourceId);
        return dbFn.insertCategory(this.connection, columns);
      })
      .then(() =>
        Promise.all([
          this.insertCategoryCoveredTypes(category),
          this.insertChildrenCategories(category),
          this.insertParentCategories(category),
        ])
      );
  }

  insertResource(category) {
    const columns = this.mapResourceToColumns(category);

    return dbFn.insertResource(this.connection, columns).then((resourceId) => {
      category.resource_id = resourceId;
      return Promise.all([
        this.insertResourceText(abstracts._name, category.abstract, category.resource_id),
        this.insertResourceText(descriptions._name, category.description, category.resource_id),
        this.insertResourceText(names._name, category.name, category.resource_id),
        this.insertResourceText(shortNames._name, category.shortName, category.resource_id),
        this.insertResourceText(urls._name, category.url, category.resource_id),
        this.insertMultimediaDescriptions(category),
      ]);
    });
  }

  updateResource(category) {
    const columns = this.mapResourceToColumns(category);

    return Promise.all([
      dbFn.updateResource(this.connection, columns),
      this.updateResourceText(abstracts._name, category.abstract, category.resource_id),
      this.updateResourceText(descriptions._name, category.description, category.resource_id),
      this.updateResourceText(names._name, category.name, category.resource_id),
      this.updateResourceText(shortNames._name, category.shortName, category.resource_id),
      this.updateResourceText(urls._name, category.url, category.resource_id),
      this.updateMultimediaDescriptions(category),
    ]).then(_.flatten);
  }

  insertMultimediaDescriptions(category) {
    const inserts = category?.multimediaDescriptions?.map((description) =>
      dbFn.insertMultimediaDescriptions(this.connection, category.resource_id, description.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateMultimediaDescriptions(category) {
    return dbFn
      .deleteMultimediaDescriptions(this.connection, category.resource_id)
      .then(() => this.insertMultimediaDescriptions(category));
  }

  insertCategoryCoveredTypes(category) {
    const inserts = category?.resourceTypes?.map((type) =>
      dbFn.insertCategoryCoveredType(this.connection, type, category.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateCategoryCoveredTypes(category) {
    return dbFn
      .deleteCategoryCoveredTypes(this.connection, category.id)
      .then(() => this.insertCategoryCoveredTypes(category));
  }

  insertChildrenCategories(category) {
    const inserts = category?.children?.map((child) =>
      dbFn.insertCategorySpecialization(this.connection, child.id, category.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateChildrenCategories(category) {
    return dbFn
      .deleteChildrenCategories(this.connection, category.id)
      .then(() => this.insertChildrenCategories(category));
  }

  insertParentCategories(category) {
    const inserts = category?.parents?.map((parent) =>
      dbFn.insertCategorySpecialization(this.connection, category.id, parent.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateParentCategories(category) {
    return dbFn.deleteParentCategories(this.connection, category.id).then(() => this.insertParentCategories(category));
  }

  mapResourceToColumns(category) {
    return {
      [schemas.resources.id]: category?.resource_id,
      [schemas.resources.type]: category?.type,
      [schemas.resources.dataProvider]: category?.dataProvider,
      [schemas.resources.lastUpdate]: category?.lastUpdate,
      [schemas.resources.simpleUrl]: _.isString(category?.url) ? category?.url : null,
    };
  }

  mapCategoryToColumns(category) {
    return {
      [schemas.categories.id]: category.id,
      [schemas.categories.resourceId]: category.resource_id,
      [schemas.categories.namespace]: category.namespace,
    };
  }

  mapRowToCategory(row) {
    const category = new Category();
    _.assign(category, row);
    return category;
  }
}

module.exports = { CategoryConnector };
