const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");
const { Category } = require("../../model/destinationdata2022/category");

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

    // TODO: re-enable
    // this.checkLastUpdate(oldCategory, newCategory);

    if (this.shouldUpdate(oldCategory, newCategory)) {
      const columns = this.mapCategoryToColumns(newCategory);

      return dbFn.updateCategory(this.connection, columns).then((ret) => {
        newCategory.resource_id = _.first(ret)?.resource_id;
        return Promise.all([this.updateResource(newCategory)]);
      });

      // return Promise.all([this.updateResource(newCategory)]).then((promises) => {
      //   newCategory.lastUpdate = _.first(_.flatten(promises))[schemas.resources.lastUpdate];
      //   return newCategory;
      // });
    }

    return Promise.resolve("nope");
    // TODO: re-enable
    // this.throwNoUpdate(oldCategory);
  }

  deleteCategory(id) {
    return dbFn.deleteCategory(this.connection, id);
  }

  insertCategory(category) {
    const categoryId = category.id;

    return this.insertResource(category)
      .then((resourceId) => {
        category.id = categoryId;
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

  insertCategoryCoveredTypes(category) {
    const inserts = category?.resourceTypes?.map((type) => {
      const columns = this.mapCategoryCoveredType(type, category.id);
      return dbFn.insertCategoryCoveredType(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertChildrenCategories(category) {
    const inserts = category?.children?.map((child) => {
      const columns = this.mapCategorySpecialization(child.id, category.id);
      return dbFn.insertCategorySpecialization(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertParentCategories(category) {
    const inserts = category?.parents?.map((parent) => {
      const columns = this.mapCategorySpecialization(category.id, parent.id);
      return dbFn.insertCategorySpecialization(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  mapResourceToColumns(resource) {
    console.log("updateResource", resource);

    return {
      [schemas.resources.id]: resource?.resource_id,
      [schemas.resources.type]: resource?.type,
      [schemas.resources.dataProvider]: resource?.dataProvider,
      [schemas.resources.lastUpdate]: resource?.lastUpdate,
      [schemas.resources.simpleUrl]: _.isString(resource?.url) ? resource?.url : null,
    };
  }

  mapCategoryToColumns(category, resourceId) {
    return {
      [schemas.categories.id]: category.id,
      [schemas.categories.resourceId]: resourceId,
      [schemas.categories.namespace]: category.namespace,
    };
  }

  mapCategoryCoveredType(type, categoryId) {
    return {
      [schemas.categoryCoveredTypes.type]: type,
      [schemas.categoryCoveredTypes.categoryId]: categoryId,
    };
  }

  mapCategorySpecialization(childId, parentId) {
    return {
      [schemas.categorySpecializations.childId]: childId,
      [schemas.categorySpecializations.parentId]: parentId,
    };
  }

  mapRowToCategory(row) {
    const category = new Category();
    Object.assign(category, row);
    return category;
  }
}

module.exports = { CategoryConnector };
