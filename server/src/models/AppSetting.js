let AppSetting= function(sequelize, DataTypes) {
    return sequelize.define("app_settings", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      applicationId:{
        type:DataTypes.STRING(150),
        allowNull: false,
        field: 'application_id'
      }, agentRouting: {
        type: DataTypes.INTEGER,
        field: "agent_routing"
      },
      botRouting: {
        type: DataTypes.BOOLEAN,
        field: "bot_routing"
      },
      widgetTheme:{
        type:DataTypes.JSON,
        allowNull: true,
        field: "widget_theme"
      },
      collectEmail:{
        type:DataTypes.BOOLEAN,
        allowNull: false,
        field: 'collect_email',
        defaultValue: 0
      }  
    },
    {
      underscored: true,
      paranoid: true
    });
  }
  module.exports = AppSetting
  