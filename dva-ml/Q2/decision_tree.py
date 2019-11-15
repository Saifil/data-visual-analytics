from util import entropy, information_gain, partition_classes
import numpy as np
import ast


class DecisionTree(object):
    def __init__(self):
        # Initializing the tree as an empty dictionary or list, as preferred
        self.tree = []
        # self.tree = {}
        pass

    def make_and_insert_node(self, X, y, index):
        if np.unique(y).shape[0] == 1:
            self.tree[index]["leaf"] = y[0]
            return

        cols = len(X[0])
        max_ig = -float('Inf')

        split_attribute = None
        X_l = X_r = y_l = y_r = None
        split_val = ''

        # is_unique_col = False
        # Get the Split Value
        for j in range(cols):  # Do for all columns
            if isinstance(X[0][j], str):
                count = {}
                max_count = 0
                for i in range(len(X)):
                    if X[i][j] not in count:
                        count[X[i][j]] = 1
                    else:
                        count[X[i][j]] += 1
                    if count[X[i][j]] > max_count:
                        max_count = count[X[i][j]]
                        split_val = X[i][j]
                # if len(count) > 1:
                # is_unique_col = True
            else:
                summation = 0
                # num_check_unique = []
                for i in range(len(X)):
                    summation += X[i][j]
                    # num_check_unique.append(X[i][j])
                split_val = 1.0 * summation / len(X)
                # if np.unique(num_check_unique).shape[0] > 1:
                #     is_unique_col = True

            # Get the Information Gain
            X_left, X_right, y_left, y_right = partition_classes(X, y, j, split_val)
            ig = information_gain(y, [y_left, y_right])
            if ig > max_ig:
                max_ig = ig
                split_attribute = j
                X_l, X_r, y_l, y_r = X_left, X_right, y_left, y_right

        # Check if column has unique elements
        num_check_unique = []
        for i in range(len(X)):
            num_check_unique.append(X[i][split_attribute])
        if np.unique(num_check_unique).shape[0] == 1:  # No unique elements in column
            unique, pos = np.unique(y, return_inverse=True)
            counts = np.bincount(pos)
            maxpos = counts.argmax()
            self.tree[index]["leaf"] = unique[maxpos]
            return

        self.tree[index]["left"] = len(self.tree)
        self.tree[index]["right"] = len(self.tree) + 1
        self.tree[index]["split_attribute"] = split_attribute
        self.tree[index]["split_val"] = split_val

        # Append left
        self.tree.append(
            {"X_train": X_l, "y_pred": y_l, "left": None, "right": None, "split_attribute": None, "split_val": None})
        # Append right
        self.tree.append(
            {"X_train": X_r, "y_pred": y_r, "left": None, "right": None, "split_attribute": None, "split_val": None})

    def learn(self, X, y):
        # TODO: Train the decision tree (self.tree) using the the sample X and labels y
        # Do for root node
        root = {"X_train": X, "y_pred": y, "left": None, "right": None, "split_attribute": None, "split_val": None}
        self.tree.append(root)
        self.make_and_insert_node(X, y, 0)

        i = 1
        while i < len(self.tree):
            if "leaf" not in self.tree[i]:
                self.make_and_insert_node(self.tree[i]["X_train"], self.tree[i]["y_pred"], i)
            i += 1

        # print(len(self.tree))

        # You will have to make use of the functions in utils.py to train the tree

        # One possible way of implementing the tree:
        #    Each node in self.tree could be in the form of a dictionary:
        #       https://docs.python.org/2/library/stdtypes.html#mapping-types-dict
        #    For example, a non-leaf node with two children can have a 'left' key and  a
        #    'right' key. You can add more keys which might help in classification
        #    (eg. split attribute and split value)

    def classify(self, record):
        # TODO: classify the record using self.tree and return the predicted label
        current_index = 0
        while "leaf" not in self.tree[current_index]:
            split_attribute = self.tree[current_index]["split_attribute"]
            split_val = self.tree[current_index]["split_val"]
            if record[split_attribute] <= split_val:
                current_index = self.tree[current_index]["left"]
            else:
                current_index = self.tree[current_index]["right"]
        return self.tree[current_index]["leaf"]