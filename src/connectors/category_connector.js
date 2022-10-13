const _ = require("lodash");
const dbFn = require("../db/functions");
const { ResourceConnector } = require("./resource_connector");
const { Category } = require("../model/destinationdata2022/category");

const { schemas } = require("../db");
const { DestinationDataError } = require("../errors");

class CategoryConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(category) {
    return this.runTransaction(() =>
      this.insertCategory(category).then(() =>
        this.retrieveCategory(category.id)
      )
    );
  }

  // TODO: change default sorting on response
  retrieve(id) {
    const categoryId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveCategory(categoryId));
  }

  retrieveResourceCategories(resource) {
    const categoriesIds = resource?.categories?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveCategory(categoriesIds));
  }

  retrieveCategoryChildren(resource) {
    const childrenIds = resource?.children?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveCategory(childrenIds));
  }

  retrieveCategoryParents(resource) {
    const parentsIds = resource?.parents?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveCategory(parentsIds));
  }

  update(category) {
    return this.runTransaction(() =>
      this.retrieveCategory(category.id).then((oldCategory) =>
        this.updateCategory(oldCategory, category)
      )
    );
  }

  delete(id) {
    const categoryId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteCategory(categoryId));
  }

  retrieveCategory(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;

    return dbFn
      .selectCategoryFromId(this.connection, id, offset, limit)
      .then((rows) => {
        if (_.isString(id)) {
          if (_.size(rows) === 1) {
            return this.mapRowToCategory(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Category resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToCategory);
        }
      });
  }

  updateCategory(oldCategory, newInput) {
    const newCategory = _.create(oldCategory);

    _.entries(newInput).forEach(([k, v]) => {
      if (!_.isUndefined(v)) newCategory[k] = v;
    });

    if (this.shouldUpdate(oldCategory, newCategory)) {
      const columns = this.mapCategoryToColumns(newCategory);

      return dbFn
        .updateCategory(this.connection, columns)
        .then((ret) => {
          newCategory.id = _.first(ret)?.id;
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

  insertMultimediaDescriptions(category) {
    const inserts = category?.multimediaDescriptions?.map((description) =>
      dbFn.insertMultimediaDescriptions(
        this.connection,
        category.id,
        description.id
      )
    );
    return Promise.all(inserts ?? []);
  }

  updateMultimediaDescriptions(category) {
    return dbFn
      .deleteMultimediaDescriptions(this.connection, category.id)
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
    return dbFn
      .deleteParentCategories(this.connection, category.id)
      .then(() => this.insertParentCategories(category));
  }

  mapCategoryToColumns(category) {
    return {
      [schemas.categories.id]: category.id,
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
