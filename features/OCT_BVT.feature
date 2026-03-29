Feature: Basic BVT flow of OCT

  Background:
    Given Login to OCT Application in selected Environment   

  Scenario: Verify OCT BVT flow
   
    When Create a new Entity in Entity Manager screen
    When Create a new Dataset in CMS screen
    When Create a new COA in COA screen
    When Create a new Map in Mapping screen
    When Create a new Import in Import Detail screen
    Then Validate values of Cost of sales and Turnover in above created calculation After Import